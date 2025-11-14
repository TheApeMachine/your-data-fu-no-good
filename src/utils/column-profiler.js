const BOOLEAN_TRUE_VALUES = new Set(['true', 't', 'yes', 'y', '1']);
const BOOLEAN_FALSE_VALUES = new Set(['false', 'f', 'no', 'n', '0']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const URL_REGEX = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
const PHONE_REGEX = /^\+?[0-9()[\]\s-]{6,}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POSTAL_CODE_REGEX = /^[0-9A-Za-z][-0-9A-Za-z ]{2,}$/;
function parseNumericString(raw) {
    let text = raw.trim();
    if (!text) {
        return { isNumeric: false };
    }
    let isCurrency = false;
    let isPercentage = false;
    // Handle accounting negatives e.g. (123)
    if (text.startsWith('(') && text.endsWith(')')) {
        text = `-${text.slice(1, -1)}`;
    }
    const currencySymbols = ['$', '€', '£', '¥', '₹'];
    if (currencySymbols.includes(text[0])) {
        isCurrency = true;
        text = text.slice(1);
    }
    if (currencySymbols.includes(text[text.length - 1])) {
        isCurrency = true;
        text = text.slice(0, -1);
    }
    if (text.endsWith('%')) {
        isPercentage = true;
        text = text.slice(0, -1);
    }
    text = text.replace(/,/g, '').replace(/_/g, '').replace(/\s+/g, '');
    if (!text) {
        return { isNumeric: false };
    }
    const value = Number(text);
    if (Number.isNaN(value)) {
        return { isNumeric: false };
    }
    return { isNumeric: true, value, isCurrency, isPercentage };
}
function detectDate(value) {
    const trimmed = value.trim();
    if (!trimmed) {
        return { isDate: false, isDateTime: false };
    }
    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) {
        return { isDate: false, isDateTime: false };
    }
    const hasTime = trimmed.includes('T') ||
        /\d{1,2}:\d{2}/.test(trimmed) ||
        /\d{1,2}\s?(AM|PM)$/i.test(trimmed);
    return {
        isDate: true,
        isDateTime: hasTime,
    };
}
function computeSkewness(values) {
    if (values.length < 3) {
        return undefined;
    }
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const diff = values.map(v => v - mean);
    const squared = diff.map(v => v * v);
    const cubed = diff.map(v => v * v * v);
    const variance = squared.reduce((s, v) => s + v, 0) / values.length;
    const stddev = Math.sqrt(variance);
    if (stddev === 0) {
        return 0;
    }
    const skewNumerator = cubed.reduce((s, v) => s + v, 0) / values.length;
    return skewNumerator / Math.pow(stddev, 3);
}
export function profileColumns(rows, options = {}) {
    if (!rows || rows.length === 0) {
        return {};
    }
    const sampleSize = options.sampleSize ?? 500;
    const columnNames = Object.keys(rows[0] ?? {});
    const profiles = {};
    for (const columnName of columnNames) {
        const columnNameLower = columnName.toLowerCase();
        const columnValues = rows.map(row => row?.[columnName]);
        const totalCount = columnValues.length;
        const nonNullValues = columnValues.filter(value => {
            if (value === null || value === undefined)
                return false;
            if (typeof value === 'string') {
                return value.trim() !== '' && value.trim().toLowerCase() !== 'null';
            }
            return true;
        });
        const sampleValues = nonNullValues.slice(0, sampleSize);
        const sampleCount = sampleValues.length;
        const numericValues = [];
        let numericCount = 0;
        let integerCount = 0;
        let positiveCount = 0;
        let zeroOneCount = 0;
        let currencyCount = 0;
        let percentageCount = 0;
        let booleanCount = 0;
        let dateCount = 0;
        let datetimeCount = 0;
        let emailCount = 0;
        let urlCount = 0;
        let phoneCount = 0;
        let uuidCount = 0;
        let postalCodeCount = 0;
        const notes = [];
        for (const rawValue of sampleValues) {
            if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
                numericCount += 1;
                numericValues.push(rawValue);
                if (Number.isInteger(rawValue))
                    integerCount += 1;
                if (rawValue > 0)
                    positiveCount += 1;
                if (rawValue === 0 || rawValue === 1)
                    zeroOneCount += 1;
                continue;
            }
            if (typeof rawValue === 'boolean') {
                booleanCount += 1;
                continue;
            }
            const textValue = String(rawValue).trim();
            if (!textValue) {
                continue;
            }
            const lowerValue = textValue.toLowerCase();
            if (BOOLEAN_TRUE_VALUES.has(lowerValue) || BOOLEAN_FALSE_VALUES.has(lowerValue)) {
                booleanCount += 1;
                continue;
            }
            const numericParse = parseNumericString(textValue);
            if (numericParse.isNumeric && numericParse.value !== undefined) {
                numericCount += 1;
                numericValues.push(numericParse.value);
                if (Number.isInteger(numericParse.value))
                    integerCount += 1;
                if (numericParse.value > 0)
                    positiveCount += 1;
                if (numericParse.value === 0 || numericParse.value === 1)
                    zeroOneCount += 1;
                if (numericParse.isCurrency)
                    currencyCount += 1;
                if (numericParse.isPercentage)
                    percentageCount += 1;
                continue;
            }
            const { isDate, isDateTime } = detectDate(textValue);
            if (isDate) {
                dateCount += 1;
                if (isDateTime)
                    datetimeCount += 1;
                continue;
            }
            if (EMAIL_REGEX.test(textValue)) {
                emailCount += 1;
                continue;
            }
            if (URL_REGEX.test(textValue)) {
                urlCount += 1;
                continue;
            }
            if (PHONE_REGEX.test(textValue)) {
                const digitsOnly = textValue.replace(/[^0-9]/g, '');
                if (digitsOnly.length >= 6) {
                    phoneCount += 1;
                }
                continue;
            }
            if (UUID_REGEX.test(textValue)) {
                uuidCount += 1;
                continue;
            }
            if (POSTAL_CODE_REGEX.test(textValue)) {
                const compact = textValue.replace(/\s+/g, '');
                const digitCount = compact.replace(/[^0-9]/g, '').length;
                const digitRatio = digitCount / Math.max(compact.length, 1);
                if (digitCount >= 3 && digitRatio >= 0.4 && compact.length >= 4 && compact.length <= 10) {
                    postalCodeCount += 1;
                }
            }
        }
        const uniqueValues = new Set(nonNullValues.map(value => (typeof value === 'string' ? value.trim() : value)));
        const uniqueCount = uniqueValues.size;
        const uniqueRatio = totalCount > 0 ? uniqueCount / totalCount : 0;
        const nullCount = totalCount - nonNullValues.length;
        let baseType = 'string';
        let semanticType;
        let confidence = 0.5;
        if (sampleCount === 0) {
            confidence = 0;
        }
        else {
            const numericRatio = numericCount / sampleCount;
            const booleanRatio = booleanCount / sampleCount;
            const dateRatio = dateCount / sampleCount;
            const datetimeRatio = datetimeCount / sampleCount;
            if (numericRatio >= 0.7) {
                baseType = 'number';
                confidence = numericRatio;
            }
            else if (dateRatio >= 0.6) {
                baseType = datetimeRatio >= 0.6 ? 'datetime' : 'date';
                confidence = dateRatio;
            }
            else if (booleanRatio >= 0.7) {
                baseType = 'boolean';
                confidence = booleanRatio;
            }
            else {
                baseType = 'string';
                confidence = Math.max(booleanRatio, dateRatio, numericRatio, 0.4);
            }
        }
        if (baseType === 'number') {
            if (currencyCount / Math.max(sampleCount, 1) >= 0.4) {
                semanticType = 'currency';
                notes.push('Detected currency formatting in sample values.');
            }
            else if (percentageCount / Math.max(sampleCount, 1) >= 0.4) {
                semanticType = 'percentage';
                notes.push('Detected percentage formatting in sample values.');
            }
            else if (zeroOneCount / Math.max(sampleCount, 1) >= 0.8) {
                semanticType = 'binary_metric';
                notes.push('Values behave like binary indicators (0/1).');
            }
        }
        else if (baseType === 'boolean') {
            semanticType = 'flag';
        }
        else if (baseType === 'date' || baseType === 'datetime') {
            semanticType = 'timestamp';
        }
        else if (baseType === 'string') {
            if (emailCount / Math.max(sampleCount, 1) >= 0.6) {
                semanticType = 'email';
            }
            else if (urlCount / Math.max(sampleCount, 1) >= 0.6) {
                semanticType = 'url';
            }
            else if (phoneCount / Math.max(sampleCount, 1) >= 0.6) {
                semanticType = 'phone';
            }
            else if (uuidCount / Math.max(sampleCount, 1) >= 0.6) {
                semanticType = 'uuid';
            }
            else if (postalCodeCount / Math.max(sampleCount, 1) >= 0.6) {
                semanticType = 'postal_code';
            }
        }
        if (columnNameLower.includes('status') || columnNameLower.includes('stage')) {
            semanticType = 'status';
            notes.push('Column name suggests workflow status.');
        }
        else if (!semanticType) {
            if (columnNameLower.includes('category') || columnNameLower.includes('segment') || columnNameLower.includes('type')) {
                semanticType = 'category';
            }
            else if (columnNameLower.includes('country')) {
                semanticType = 'country';
            }
            else if (columnNameLower.includes('city')) {
                semanticType = 'city';
            }
        }
        if ((columnNameLower.endsWith('id') || columnNameLower.includes('_id')) && !semanticType) {
            semanticType = 'identifier';
        }
        const numericSubtype = baseType === 'number'
            ? integerCount === numericCount
                ? 'integer'
                : 'float'
            : undefined;
        const numericStats = baseType === 'number' && numericValues.length > 0
            ? {
                min: Math.min(...numericValues),
                max: Math.max(...numericValues),
                mean: numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length,
                stddev: (() => {
                    const mean = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
                    const variance = numericValues
                        .map(v => (v - mean) ** 2)
                        .reduce((sum, v) => sum + v, 0) / numericValues.length;
                    return Math.sqrt(variance);
                })(),
                skewness: computeSkewness(numericValues),
            }
            : undefined;
        if (numericStats && numericStats.skewness && Math.abs(numericStats.skewness) > 1.5) {
            notes.push(`Highly skewed distribution detected (skewness ${numericStats.skewness.toFixed(2)}).`);
        }
        const isCategorical = baseType === 'string'
            ? uniqueRatio <= 0.3 && uniqueCount <= 100
            : baseType === 'number'
                ? numericSubtype === 'integer' && uniqueCount <= 30
                : false;
        const isIdentifier = semanticType === 'identifier' ||
            uniqueRatio > 0.9 ||
            (!!semanticType && ['email', 'uuid'].includes(semanticType));
        profiles[columnName] = {
            base_type: baseType,
            semantic_type: semanticType,
            confidence,
            unique_count: uniqueCount,
            unique_ratio: uniqueRatio,
            null_count: nullCount,
            non_null_count: nonNullValues.length,
            total_count: totalCount,
            is_categorical: isCategorical,
            is_identifier: isIdentifier,
            numeric_subtype: numericSubtype,
            sample_value: sampleValues[0],
            sample_values: sampleValues.slice(0, 5),
            notes: notes.length > 0 ? notes : undefined,
            stats: numericStats,
        };
    }
    return profiles;
}
import { MinHash } from './minhash';
export async function computeDeepColumnProfiles(db, datasetId) {
    const dataset = await db.prepare('SELECT columns FROM datasets WHERE id = ?').bind(datasetId).first();
    if (!dataset)
        return {};
    const columns = JSON.parse(dataset.columns);
    const candidateColumns = columns.filter(c => c.type === 'string' && c.profile && c.profile.unique_ratio < 0.95); // Don't profile pure identifiers
    const deepProfiles = {};
    for (const col of candidateColumns) {
        const rowsResult = await db.prepare('SELECT data FROM data_rows WHERE dataset_id = ?').bind(datasetId).all();
        if (!rowsResult.results)
            continue;
        const values = new Set();
        rowsResult.results.forEach(row => {
            try {
                const parsed = JSON.parse(row.data);
                const val = parsed[col.name];
                if (typeof val === 'string' && val) {
                    values.add(val.trim());
                }
            }
            catch { }
        });
        if (values.size > 10) {
            const minhash = new MinHash();
            values.forEach(v => minhash.update(v));
            deepProfiles[col.name] = { minhash: minhash.serialize() };
        }
    }
    return deepProfiles;
}
