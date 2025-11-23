/**
 * PostForge Converter - Type Definitions
 *
 * Ce fichier définit tous les types TypeScript pour le système de conversion Markdown.
 * Architecture: Preprocessor → Markdown Engine → Preset Engine
 */

// ============================================================================
// Markdown Engine Types
// ============================================================================

/**
 * Options de configuration pour le moteur de conversion Markdown
 */
export interface MarkdownOptions {
  /**
   * Activer GitHub Flavored Markdown (tables, strikethrough, autolinks)
   * @default true
   */
  gfm?: boolean;

  /**
   * Activer la sanitization XSS du HTML généré
   * @default true
   * @security CRITIQUE - Toujours activer en production
   */
  sanitize?: boolean;

  /**
   * Normaliser les smart quotes et caractères Unicode
   * @default true
   */
  smartQuotes?: boolean;
}

// ============================================================================
// Preprocessor Types
// ============================================================================

/**
 * Options de configuration pour le préprocesseur WhatsApp
 */
export interface PreprocessOptions {
  /**
   * Activer/désactiver le préprocesseur
   */
  enabled: boolean;

  /**
   * Préserver les code blocks sans transformation
   * @default true
   * @security CRITIQUE - Ne jamais désactiver
   */
  preserveCode?: boolean;
}

// ============================================================================
// Preset Types
// ============================================================================

/**
 * Types de presets disponibles pour les plateformes
 */
export type PresetType = 'linkedin' | 'whatsapp' | 'email';

/**
 * Résultat de l'application d'un preset
 */
export interface PresetResult {
  /**
   * Markdown transformé selon le preset
   */
  markdown: string;

  /**
   * HTML final après application du preset
   */
  html: string;

  /**
   * Notes et informations sur les transformations appliquées
   * Exemples: "Hashtags déplacés en fin", "Paragraphes normalisés"
   */
  notes?: string[];
}

// ============================================================================
// Converter Global Types
// ============================================================================

/**
 * Options complètes du converter (toutes les couches)
 */
export interface ConverterOptions {
  /**
   * Options du préprocesseur WhatsApp
   */
  preprocess?: PreprocessOptions;

  /**
   * Options du moteur Markdown
   */
  markdown?: MarkdownOptions;

  /**
   * Type de preset à appliquer (optionnel)
   */
  preset?: PresetType;
}

/**
 * Résultat final du converter après toutes les transformations
 */
export interface ConverterResult {
  /**
   * Markdown normalisé (après preprocessing)
   */
  markdown: string;

  /**
   * HTML sanitized généré
   */
  html: string;

  /**
   * Résultat du preset si appliqué
   */
  preset?: PresetResult;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type pour les fonctions de transformation de texte
 */
export type TextTransformer = (input: string) => string;

/**
 * Type pour les fonctions de transformation async
 */
export type AsyncTextTransformer = (input: string) => Promise<string>;

/**
 * Configuration de normalisation du texte
 */
export interface NormalizationConfig {
  /**
   * Collapser les retours à la ligne multiples
   * @default true
   */
  collapseNewlines?: boolean;

  /**
   * Normaliser les smart quotes
   * @default true
   */
  normalizeQuotes?: boolean;

  /**
   * Normaliser les espaces Unicode
   * @default true
   */
  normalizeSpaces?: boolean;

  /**
   * Trim début et fin sans retirer l'indentation
   * @default true
   */
  trimEdges?: boolean;
}
