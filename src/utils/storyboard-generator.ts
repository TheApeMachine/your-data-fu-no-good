// Automated Storyboard Generation
// Creates narrative reports from data insights using AI

import type { DatabaseBinding } from '../storage/types';
import type { Analysis } from '../types';

export interface Storyboard {
  id: string;
  datasetId: number;
  datasetName: string;
  title: string;
  executiveSummary: string;
  sections: StoryboardSection[];
  keyTakeaways: string[];
  recommendedActions: ActionItem[];
  visualizations: VisualizationReference[];
  generatedAt: string;
  metadata: {
    insightCount: number;
    visualizationCount: number;
    confidenceScore: number;
  };
}

export interface StoryboardSection {
  id: string;
  title: string;
  narrative: string;
  insights: InsightSummary[];
  visualizationIds: number[];
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface InsightSummary {
  type: string;
  column?: string;
  summary: string;
  confidence: number;
  importance: string;
}

export interface ActionItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  expectedImpact: string;
  relatedInsights: string[];
}

export interface VisualizationReference {
  id: number;
  type: string;
  title: string;
  sectionId: string;
}

/**
 * Group insights by theme/topic
 */
function groupInsightsByTheme(analyses: Analysis[]): Map<string, Analysis[]> {
  const themes = new Map<string, Analysis[]>();

  // Define themes based on analysis types
  const themeMapping: Record<string, string> = {
    'statistics': 'Data Distribution',
    'correlation': 'Relationships & Patterns',
    'trend': 'Temporal Trends',
    'timeseries': 'Temporal Trends',
    'anomaly': 'Data Quality & Anomalies',
    'outlier': 'Data Quality & Anomalies',
    'missing': 'Data Quality & Anomalies',
    'pattern': 'Categorical Patterns',
    'feature': 'Feature Engineering Opportunities',
    'clustering': 'Segmentation & Grouping',
    'pca': 'Dimensionality & Structure'
  };

  for (const analysis of analyses) {
    const theme = themeMapping[analysis.analysis_type] || 'Other Insights';
    const list = themes.get(theme) || [];
    list.push(analysis);
    themes.set(theme, list);
  }

  return themes;
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(
  analyses: Analysis[],
  datasetName: string,
  rowCount: number
): string {
  const insights = analyses.length;
  const highImportance = analyses.filter(a => a.importance === 'high' || a.importance === 'critical').length;

  const criticalIssues = analyses.filter(a =>
    a.analysis_type === 'anomaly' ||
    a.analysis_type === 'missing' ||
    (a.analysis_type === 'trend' && a.result?.strength > 0.7)
  );

  const correlations = analyses.filter(a => a.analysis_type === 'correlation');
  const strongCorrelations = correlations.filter(a => Math.abs(a.result?.best_strength || 0) > 0.7).length;

  let summary = `Analysis of "${datasetName}" (${rowCount.toLocaleString()} rows) revealed ${insights} key insights`;

  if (highImportance > 0) {
    summary += `, including ${highImportance} high-priority findings`;
  }

  summary += '. ';

  if (criticalIssues.length > 0) {
    summary += `Data quality analysis identified ${criticalIssues.length} areas requiring attention. `;
  }

  if (strongCorrelations > 0) {
    summary += `Strong relationships were discovered between ${strongCorrelations} variable pairs, suggesting underlying patterns. `;
  }

  const clustering = analyses.find(a => a.analysis_type === 'clustering');
  if (clustering) {
    const clusterCount = clustering.result?.clusters?.length || 0;
    if (clusterCount > 0) {
      summary += `The dataset naturally segments into ${clusterCount} distinct groups. `;
    }
  }

  const pca = analyses.find(a => a.analysis_type === 'pca');
  if (pca && pca.result?.recommendedComponents) {
    const reduction = pca.result.featureNames.length - pca.result.recommendedComponents;
    if (reduction > 0) {
      summary += `Dimensionality reduction reveals ${reduction} features can be removed while retaining 80% of variance. `;
    }
  }

  return summary.trim();
}

/**
 * Generate narrative for a themed section
 */
function generateSectionNarrative(
  theme: string,
  analyses: Analysis[]
): string {
  const sortedByImportance = [...analyses].sort((a, b) => {
    const importanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    return (importanceOrder[a.importance as keyof typeof importanceOrder] || 3) -
           (importanceOrder[b.importance as keyof typeof importanceOrder] || 3);
  });

  const topInsights = sortedByImportance.slice(0, 3);

  let narrative = '';

  switch (theme) {
    case 'Data Distribution':
      narrative = 'Statistical profiling reveals the fundamental characteristics of your data. ';
      if (topInsights.some(a => a.result?.stdDev > a.result?.mean)) {
        narrative += 'Several columns exhibit high variance relative to their means, indicating diverse value ranges that may require normalization for modeling. ';
      }
      break;

    case 'Relationships & Patterns':
      const strongCorr = analyses.filter(a => Math.abs(a.result?.best_strength || 0) > 0.7);
      const moderateCorr = analyses.filter(a => {
        const strength = Math.abs(a.result?.best_strength || 0);
        return strength >= 0.45 && strength < 0.7;
      });

      narrative = `Correlation analysis examined ${analyses.length} variable relationships. `;
      if (strongCorr.length > 0) {
        narrative += `${strongCorr.length} strong correlations were identified, suggesting redundant features or underlying causal relationships. `;
      }
      if (moderateCorr.length > 0) {
        narrative += `Additionally, ${moderateCorr.length} moderate correlations warrant further investigation for predictive modeling. `;
      }
      break;

    case 'Temporal Trends':
      const upTrends = analyses.filter(a => a.result?.direction === 'up' && a.result?.strength > 0.5);
      const downTrends = analyses.filter(a => a.result?.direction === 'down' && a.result?.strength > 0.5);

      narrative = 'Time-series analysis reveals how your data evolves over time. ';
      if (upTrends.length > 0) {
        narrative += `${upTrends.length} variables show significant upward trends, indicating growth or accumulation. `;
      }
      if (downTrends.length > 0) {
        narrative += `${downTrends.length} variables exhibit declining trends, which may signal issues or natural decay. `;
      }
      if (upTrends.length === 0 && downTrends.length === 0) {
        narrative += 'Most temporal patterns are stable, suggesting data stationarity suitable for forecasting. ';
      }
      break;

    case 'Data Quality & Anomalies':
      const missingData = analyses.filter(a => a.analysis_type === 'missing');
      const anomalies = analyses.filter(a => a.analysis_type === 'anomaly' || a.analysis_type === 'outlier');

      narrative = 'Data quality assessment identifies potential issues requiring remediation. ';
      if (missingData.length > 0) {
        const avgMissing = missingData.reduce((sum, a) => sum + (a.result?.percentage || 0), 0) / missingData.length;
        narrative += `Missing data affects ${missingData.length} columns with an average rate of ${avgMissing.toFixed(1)}%. `;
      }
      if (anomalies.length > 0) {
        narrative += `Anomaly detection flagged ${anomalies.length} columns with unusual value distributions that may indicate measurement errors or genuine outliers. `;
      }
      break;

    case 'Categorical Patterns':
      narrative = 'Analysis of categorical variables reveals dominant patterns and class imbalances. ';
      const imbalanced = analyses.filter(a => {
        const topPattern = a.result?.topPatterns?.[0];
        return topPattern && topPattern.percentage > 60;
      });
      if (imbalanced.length > 0) {
        narrative += `${imbalanced.length} columns show significant class imbalance, which may require special handling in machine learning workflows. `;
      }
      break;

    case 'Segmentation & Grouping':
      const clusterAnalysis = analyses[0];
      if (clusterAnalysis?.result?.clusters) {
        const clusters = clusterAnalysis.result.clusters;
        narrative = `K-means clustering identified ${clusters.length} natural segments in your data. `;
        narrative += 'These groups represent distinct cohorts with unique characteristics, enabling targeted strategies for each segment. ';
      } else {
        narrative = 'Clustering analysis helps identify natural groupings within your data for segmentation strategies.';
      }
      break;

    case 'Dimensionality & Structure':
      const pcaAnalysis = analyses[0];
      if (pcaAnalysis?.result) {
        const { featureNames, recommendedComponents, explainedVariance } = pcaAnalysis.result;
        const totalFeatures = featureNames?.length || 0;
        const reduction = totalFeatures - (recommendedComponents || totalFeatures);

        narrative = `Principal Component Analysis reveals the underlying structure of ${totalFeatures} features. `;
        if (reduction > 0) {
          narrative += `${recommendedComponents} components capture 80% of variance, allowing ${reduction} features to be removed. `;
          if (explainedVariance?.[0] > 50) {
            narrative += `The first component alone explains ${explainedVariance[0].toFixed(1)}% of total variance, indicating a dominant underlying factor. `;
          }
        }
      }
      break;

    default:
      narrative = `Analysis of ${analyses.length} additional patterns provides supplementary insights into data characteristics.`;
  }

  return narrative;
}

/**
 * Generate recommended actions based on insights
 */
function generateRecommendedActions(analyses: Analysis[]): ActionItem[] {
  const actions: ActionItem[] = [];

  // Missing data actions
  const missingData = analyses.filter(a => a.analysis_type === 'missing' && (a.result?.percentage || 0) > 15);
  if (missingData.length > 0) {
    const avgMissing = missingData.reduce((sum, a) => sum + (a.result?.percentage || 0), 0) / missingData.length;
    actions.push({
      priority: avgMissing > 40 ? 'critical' : avgMissing > 25 ? 'high' : 'medium',
      action: `Address missing data in ${missingData.length} columns`,
      rationale: `Average missing rate of ${avgMissing.toFixed(1)}% may bias analysis results`,
      expectedImpact: 'Improved data completeness and model accuracy',
      relatedInsights: missingData.map(a => `Missing data in ${a.column_name}`)
    });
  }

  // Anomaly actions
  const anomalies = analyses.filter(a =>
    (a.analysis_type === 'anomaly' || a.analysis_type === 'outlier') &&
    (a.result?.share || 0) > 5
  );
  if (anomalies.length > 0) {
    actions.push({
      priority: 'high',
      action: `Investigate and handle outliers in ${anomalies.length} variables`,
      rationale: 'Anomalies may represent data quality issues or genuine extreme events',
      expectedImpact: 'Cleaner data distribution, reduced model sensitivity to extremes',
      relatedInsights: anomalies.map(a => `Anomalies in ${a.column_name}`)
    });
  }

  // Correlation/multicollinearity actions
  const strongCorrelations = analyses.filter(a =>
    a.analysis_type === 'correlation' && Math.abs(a.result?.best_strength || 0) > 0.8
  );
  if (strongCorrelations.length > 3) {
    actions.push({
      priority: 'medium',
      action: 'Apply dimensionality reduction to correlated features',
      rationale: `${strongCorrelations.length} strong correlations indicate feature redundancy`,
      expectedImpact: 'Reduced model complexity, improved interpretability, faster training',
      relatedInsights: [`${strongCorrelations.length} strong correlations detected`]
    });
  }

  // Feature engineering actions
  const featureSuggestions = analyses.filter(a => a.analysis_type === 'feature');
  if (featureSuggestions.length > 0) {
    actions.push({
      priority: 'medium',
      action: `Implement ${featureSuggestions.length} feature engineering transformations`,
      rationale: 'Engineered features can improve model performance and interpretability',
      expectedImpact: 'Enhanced predictive power, better handling of skewed or categorical data',
      relatedInsights: featureSuggestions.map(a => a.result?.name || 'Feature suggestion')
    });
  }

  // Trend/forecasting actions
  const strongTrends = analyses.filter(a =>
    (a.analysis_type === 'trend' || a.analysis_type === 'timeseries') &&
    (a.result?.strength || 0) > 0.6
  );
  if (strongTrends.length > 0) {
    actions.push({
      priority: 'medium',
      action: 'Build time-series forecasting models',
      rationale: `${strongTrends.length} variables show strong temporal trends suitable for prediction`,
      expectedImpact: 'Proactive decision-making based on future projections',
      relatedInsights: strongTrends.map(a => `Trend in ${a.column_name}`)
    });
  }

  // PCA action
  const pca = analyses.find(a => a.analysis_type === 'pca');
  if (pca && pca.result?.recommendedComponents) {
    const reduction = pca.result.featureNames.length - pca.result.recommendedComponents;
    if (reduction > 0) {
      actions.push({
        priority: 'medium',
        action: `Reduce dimensionality using PCA (${pca.result.featureNames.length} → ${pca.result.recommendedComponents} features)`,
        rationale: 'Most variance captured by fewer components, reducing noise and complexity',
        expectedImpact: 'Faster model training, reduced overfitting, easier visualization',
        relatedInsights: ['PCA dimensionality analysis']
      });
    }
  }

  // Sort by priority
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actions;
}

/**
 * Generate key takeaways
 */
function generateKeyTakeaways(analyses: Analysis[], actions: ActionItem[]): string[] {
  const takeaways: string[] = [];

  // Data quality takeaway
  const qualityIssues = analyses.filter(a =>
    a.analysis_type === 'missing' || a.analysis_type === 'anomaly' || a.analysis_type === 'outlier'
  );
  if (qualityIssues.length > 0) {
    takeaways.push(`Data quality requires attention: ${qualityIssues.length} potential issues identified`);
  } else {
    takeaways.push('Data quality is strong with minimal missing values or anomalies');
  }

  // Relationships takeaway
  const strongCorr = analyses.filter(a =>
    a.analysis_type === 'correlation' && Math.abs(a.result?.best_strength || 0) > 0.7
  );
  if (strongCorr.length > 0) {
    takeaways.push(`${strongCorr.length} strong relationships discovered between variables`);
  }

  // Temporal takeaway
  const trends = analyses.filter(a =>
    (a.analysis_type === 'trend' || a.analysis_type === 'timeseries') && (a.result?.strength || 0) > 0.5
  );
  if (trends.length > 0) {
    takeaways.push(`Temporal patterns detected in ${trends.length} variables`);
  }

  // Segmentation takeaway
  const clustering = analyses.find(a => a.analysis_type === 'clustering');
  if (clustering && clustering.result?.clusters) {
    takeaways.push(`Dataset naturally segments into ${clustering.result.clusters.length} distinct groups`);
  }

  // Actionability takeaway
  const highPriorityActions = actions.filter(a => a.priority === 'critical' || a.priority === 'high');
  if (highPriorityActions.length > 0) {
    takeaways.push(`${highPriorityActions.length} high-priority actions recommended for immediate implementation`);
  }

  return takeaways;
}

/**
 * Generate automated storyboard from dataset analyses
 */
export async function generateStoryboard(
  db: DatabaseBinding,
  datasetId: number
): Promise<Storyboard | null> {
  // Fetch dataset info
  const dataset = await db.prepare('SELECT * FROM datasets WHERE id = ?')
    .bind(datasetId)
    .first<any>();

  if (!dataset) return null;

  // Fetch all analyses
  const analysesResult = await db.prepare(
    'SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC, importance DESC, confidence DESC'
  ).bind(datasetId).all<any>();

  const analyses: Analysis[] = analysesResult.results.map(a => ({
    ...a,
    result: typeof a.result === 'string' ? JSON.parse(a.result) : a.result
  }));

  if (analyses.length === 0) return null;

  // Fetch visualizations
  const vizResult = await db.prepare(
    'SELECT id, chart_type, title, analysis_id FROM visualizations WHERE dataset_id = ?'
  ).bind(datasetId).all<any>();

  const visualizations = vizResult.results;

  // Group insights by theme
  const themes = groupInsightsByTheme(analyses);

  // Generate sections
  const sections: StoryboardSection[] = [];
  let sectionIndex = 0;

  for (const [theme, themeAnalyses] of themes.entries()) {
    const sectionId = `section-${sectionIndex++}`;

    // Find associated visualizations
    const analysisIds = new Set(themeAnalyses.map(a => a.id));
    const sectionVizIds = visualizations
      .filter(v => v.analysis_id && analysisIds.has(v.analysis_id))
      .map(v => v.id);

    // Determine section importance
    const hasHighImportance = themeAnalyses.some(a => a.importance === 'high' || a.importance === 'critical');
    const avgConfidence = themeAnalyses.reduce((sum, a) => sum + a.confidence, 0) / themeAnalyses.length;

    const importance: StoryboardSection['importance'] =
      hasHighImportance && avgConfidence > 0.7 ? 'critical' :
      hasHighImportance ? 'high' :
      avgConfidence > 0.6 ? 'medium' : 'low';

    sections.push({
      id: sectionId,
      title: theme,
      narrative: generateSectionNarrative(theme, themeAnalyses),
      insights: themeAnalyses.map(a => ({
        type: a.analysis_type,
        column: a.column_name,
        summary: a.explanation.substring(0, 200) + (a.explanation.length > 200 ? '...' : ''),
        confidence: a.confidence,
        importance: a.importance
      })),
      visualizationIds: sectionVizIds,
      importance
    });
  }

  // Sort sections by importance
  const importanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  sections.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance]);

  // Generate actions and takeaways
  const actions = generateRecommendedActions(analyses);
  const takeaways = generateKeyTakeaways(analyses, actions);

  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(analyses, dataset.name, dataset.row_count);

  // Calculate overall confidence
  const avgConfidence = analyses.reduce((sum, a) => sum + (a.quality_score || a.confidence * 100), 0) / analyses.length / 100;

  const vizReferences: VisualizationReference[] = visualizations.map(v => {
    const section = sections.find(s => s.visualizationIds.includes(v.id));
    return {
      id: v.id,
      type: v.chart_type,
      title: v.title,
      sectionId: section?.id || 'unknown'
    };
  });

  const storyboard: Storyboard = {
    id: `storyboard-${datasetId}-${Date.now()}`,
    datasetId,
    datasetName: dataset.name,
    title: `Data Analysis Report: ${dataset.name}`,
    executiveSummary,
    sections,
    keyTakeaways: takeaways,
    recommendedActions: actions,
    visualizations: vizReferences,
    generatedAt: new Date().toISOString(),
    metadata: {
      insightCount: analyses.length,
      visualizationCount: visualizations.length,
      confidenceScore: avgConfidence
    }
  };

  return storyboard;
}

/**
 * Export storyboard as markdown
 */
export function exportStoryboardAsMarkdown(storyboard: Storyboard): string {
  let md = `# ${storyboard.title}\n\n`;
  md += `**Generated:** ${new Date(storyboard.generatedAt).toLocaleString()}\n\n`;
  md += `**Dataset:** ${storyboard.datasetName} (${storyboard.metadata.insightCount} insights, ${storyboard.metadata.visualizationCount} visualizations)\n\n`;
  md += `---\n\n`;

  // Executive Summary
  md += `## Executive Summary\n\n`;
  md += `${storyboard.executiveSummary}\n\n`;

  // Key Takeaways
  md += `## Key Takeaways\n\n`;
  for (const takeaway of storyboard.keyTakeaways) {
    md += `- ${takeaway}\n`;
  }
  md += `\n`;

  // Sections
  md += `## Detailed Findings\n\n`;
  for (const section of storyboard.sections) {
    md += `### ${section.title}\n\n`;
    md += `${section.narrative}\n\n`;

    if (section.insights.length > 0) {
      md += `**Key Insights:**\n\n`;
      for (const insight of section.insights.slice(0, 5)) {
        md += `- **${insight.type}** ${insight.column ? `(${insight.column})` : ''}: ${insight.summary}\n`;
      }
      md += `\n`;
    }

    if (section.visualizationIds.length > 0) {
      md += `*See visualizations: ${section.visualizationIds.map(id => `Chart #${id}`).join(', ')}*\n\n`;
    }
  }

  // Recommended Actions
  md += `## Recommended Actions\n\n`;
  for (const action of storyboard.recommendedActions) {
    md += `### ${action.priority.toUpperCase()}: ${action.action}\n\n`;
    md += `**Rationale:** ${action.rationale}\n\n`;
    md += `**Expected Impact:** ${action.expectedImpact}\n\n`;
  }

  md += `---\n\n`;
  md += `*This report was automatically generated by the Data Intelligence Platform.*\n`;

  return md;
}
