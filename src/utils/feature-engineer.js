function createSuggestionKey(suggestion) {
    return `${suggestion.transformation}:${suggestion.columns.join('|')}`;
}
export function deriveFeatureSuggestions(rows, columns) {
    if (!rows || rows.length === 0 || !columns || columns.length === 0) {
        return [];
    }
    const suggestions = [];
    const rowCount = rows.length;
    const addSuggestion = (suggestion) => {
        const key = createSuggestionKey(suggestion);
        if (!suggestions.some(entry => entry.key === key)) {
            suggestions.push({ key, suggestion });
        }
    };
    for (const column of columns) {
        const profile = column.profile;
        const columnName = column.name;
        if (!profile) {
            continue;
        }
        if (['number'].includes(column.type)) {
            const stats = profile.stats;
            if (stats) {
                const skewness = stats.skewness ?? 0;
                if (stats.min !== undefined && stats.min > 0 && Math.abs(skewness) > 1) {
                    addSuggestion({
                        name: `Create a smoother scale for ${columnName}`,
                        description: `${columnName} has a few very large values compared to the rest. Adding a log-scaled helper column keeps those spikes while making charts and comparisons easier to read.`,
                        columns: [columnName],
                        transformation: 'log1p',
                        confidence: 0.8,
                        expected_benefit: 'Keeps outliers visible but easier to compare with the rest of the data',
                        notes: stats.min > 0
                            ? ['Uses natural log (log1p) to handle large ranges']
                            : ['Only works when values are zero or positive'],
                    });
                }
                if (stats.mean !== undefined && stats.mean !== 0 && stats.stddev !== undefined) {
                    const coefficient = Math.abs(stats.stddev / stats.mean);
                    if (coefficient > 1) {
                        addSuggestion({
                            name: `Add a normalised version of ${columnName}`,
                            description: `${columnName} swings a lot compared with its average value. Creating a normalised helper column (values centred around 0) makes it easier to compare with other metrics on the same scale.`,
                            columns: [columnName],
                            transformation: 'standardize',
                            confidence: 0.6,
                            expected_benefit: 'Helps dashboards and future models compare different metrics on equal footing',
                        });
                    }
                }
            }
            if (profile.numeric_subtype === 'integer' && (profile.unique_count ?? 0) > 2 && (profile.unique_count ?? 0) <= 20) {
                addSuggestion({
                    name: `Split ${columnName} into simple yes/no columns`,
                    description: `${columnName} only uses a handful of codes. Turning each code into its own yes/no column makes it easy to filter or run comparisons without writing formulas.`,
                    columns: [columnName],
                    transformation: 'one_hot_encoding',
                    confidence: 0.7,
                    expected_benefit: 'Makes low-cardinality codes searchable and chart-friendly',
                });
            }
        }
        if (column.type === 'date' || column.type === 'datetime' || profile.semantic_type === 'timestamp') {
            addSuggestion({
                name: `Add calendar helpers for ${columnName}`,
                description: `${columnName} is a date or timestamp. Creating helper columns like day of week, month, or quarter makes it easier to spot seasonal patterns without manual formulas.`,
                columns: [columnName],
                transformation: 'datetime_components',
                confidence: 0.6,
                expected_benefit: 'Automatically surfaces weekly or monthly patterns for reports',
            });
        }
        if (profile.semantic_type === 'email') {
            addSuggestion({
                name: `Keep only the email domain from ${columnName}`,
                description: `${columnName} stores email addresses. A helper column with just the part after @ (for example gmail.com) quickly groups contacts by company or provider.`,
                columns: [columnName],
                transformation: 'extract_domain',
                confidence: 0.85,
                expected_benefit: 'Groups contacts by organisation for segmentation and churn analysis',
            });
        }
        if (profile.semantic_type === 'url') {
            addSuggestion({
                name: `Summarise the website in ${columnName}`,
                description: `${columnName} contains web links. Keeping just the website host (for example example.com) shows which sites or partners appear most often.`,
                columns: [columnName],
                transformation: 'extract_host',
                confidence: 0.75,
                expected_benefit: 'Highlights top sources or destinations without complex parsing',
            });
        }
        if (profile.null_count > 0) {
            const nullPercentage = (profile.null_count / Math.max(profile.total_count, 1)) * 100;
            if (nullPercentage >= 5) {
                addSuggestion({
                    name: `Add a missing-data flag for ${columnName}`,
                    description: `${columnName} is empty in ${profile.null_count} rows (${nullPercentage.toFixed(1)}%). Adding a simple yes/no "was missing" column keeps that information visible in charts and filters.`,
                    columns: [columnName],
                    transformation: 'missing_indicator',
                    confidence: 0.7,
                    expected_benefit: 'Makes it easy to track gaps and spot data quality issues',
                });
            }
        }
        if (profile.is_identifier) {
            addSuggestion({
                name: `Summarise the ID in ${columnName}`,
                description: `${columnName} behaves like a unique reference number. Storing its length or a short hashed version keeps the ID useful for joins without exposing sensitive details.`,
                columns: [columnName],
                transformation: 'identifier_encoding',
                confidence: 0.55,
                expected_benefit: 'Keeps join keys usable while hiding sensitive values',
            });
        }
    }
    // Limit total suggestions to keep UX manageable
    return suggestions.slice(0, 25).map(entry => entry.suggestion);
}
