import { v4 as uuidv4 } from 'uuid';

/**
 * Form Template Engine
 * 
 * A standalone, framework-agnostic engine for creating custom forms.
 * Generates serializable form structures that can be saved to a database.
 * 
 * Core principles:
 * - One question = one object
 * - Each question has a unique UUID
 * - Minimal but extensible structure
 * - No UI framework dependencies
 */

/**
 * Supported input types
 */
export const INPUT_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  CURRENCY: 'currency',
  TEXTAREA: 'textarea',
  DATE: 'date',
  SELECT: 'select',
  DROPDOWN: 'dropdown',
  CHECKBOXES: 'checkboxes',
};

/**
 * Input types that require options
 */
const OPTION_BASED_TYPES = [
  INPUT_TYPES.SELECT,
  INPUT_TYPES.DROPDOWN,
  INPUT_TYPES.CHECKBOXES,
];

/**
 * Validates if an input type is supported
 * @param {string} type - The input type to validate
 * @returns {boolean} - True if type is valid
 */
export const isValidInputType = (type) => {
  return Object.values(INPUT_TYPES).includes(type);
};

/**
 * Checks if an input type requires options
 * @param {string} type - The input type to check
 * @returns {boolean} - True if type requires options
 */
export const requiresOptions = (type) => {
  return OPTION_BASED_TYPES.includes(type);
};

/**
 * Creates a new form question object
 * 
 * @param {Object} params - Question parameters
 * @param {string} params.label - The question text
 * @param {string} params.type - The input type (must be from INPUT_TYPES)
 * @param {boolean} params.required - Whether the question is required
 * @param {string[]} [params.options] - Array of option strings (only for select/dropdown/checkboxes)
 * @returns {Object} - The question object
 * @throws {Error} - If validation fails
 */
export const createQuestion = ({ label, type, required, options }) => {
  // Validate label
  if (!label || typeof label !== 'string' || !label.trim()) {
    throw new Error('Label is required and must be a non-empty string');
  }

  // Validate type
  if (!isValidInputType(type)) {
    throw new Error(`Invalid input type: ${type}. Must be one of: ${Object.values(INPUT_TYPES).join(', ')}`);
  }

  // Validate required field
  if (typeof required !== 'boolean') {
    throw new Error('Required field must be a boolean');
  }

  // Build the question object
  const question = {
    id: uuidv4(),
    label: label.trim(),
    type: type.toLowerCase(),
    required,
  };

  // Add options only if the type supports them
  if (requiresOptions(type)) {
    if (!options || !Array.isArray(options) || options.length === 0) {
      throw new Error(`Input type "${type}" requires a non-empty options array`);
    }
    
    // Validate that all options are strings
    const invalidOptions = options.filter(opt => typeof opt !== 'string' || !opt.trim());
    if (invalidOptions.length > 0) {
      throw new Error('All options must be non-empty strings');
    }
    
    question.options = options.map(opt => opt.trim());
  } else if (options) {
    // Warn if options are provided for a type that doesn't support them
    console.warn(`Input type "${type}" does not support options. Options will be ignored.`);
  }

  return question;
};

/**
 * Creates a form template from an array of question configurations
 * 
 * @param {Array} questionConfigs - Array of question configuration objects
 * @returns {Array} - Array of question objects
 */
export const createFormTemplate = (questionConfigs) => {
  if (!Array.isArray(questionConfigs)) {
    throw new Error('Question configurations must be an array');
  }

  return questionConfigs.map((config, index) => {
    try {
      return createQuestion(config);
    } catch (error) {
      throw new Error(`Error creating question at index ${index}: ${error.message}`);
    }
  });
};

/**
 * Validates a complete form template
 * 
 * @param {Array} template - The form template to validate
 * @returns {Object} - Validation result with isValid and errors properties
 */
export const validateFormTemplate = (template) => {
  const errors = [];

  if (!Array.isArray(template)) {
    return {
      isValid: false,
      errors: ['Template must be an array'],
    };
  }

  if (template.length === 0) {
    return {
      isValid: false,
      errors: ['Template must contain at least one question'],
    };
  }

  const seenIds = new Set();

  template.forEach((question, index) => {
    // Check required fields
    if (!question.id) {
      errors.push(`Question at index ${index} is missing an id`);
    } else if (seenIds.has(question.id)) {
      errors.push(`Duplicate id found at index ${index}: ${question.id}`);
    } else {
      seenIds.add(question.id);
    }

    if (!question.label || typeof question.label !== 'string') {
      errors.push(`Question at index ${index} is missing a valid label`);
    }

    if (!isValidInputType(question.type)) {
      errors.push(`Question at index ${index} has invalid type: ${question.type}`);
    }

    if (typeof question.required !== 'boolean') {
      errors.push(`Question at index ${index} has invalid required field`);
    }

    // Check options for types that require them
    if (requiresOptions(question.type)) {
      if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        errors.push(`Question at index ${index} with type "${question.type}" requires options`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Serializes a form template to JSON
 * 
 * @param {Array} template - The form template to serialize
 * @returns {string} - JSON string representation
 */
export const serializeFormTemplate = (template) => {
  return JSON.stringify(template, null, 2);
};

/**
 * Deserializes a form template from JSON
 * 
 * @param {string} json - The JSON string to deserialize
 * @returns {Array} - The deserialized form template
 */
export const deserializeFormTemplate = (json) => {
  try {
    const template = JSON.parse(json);
    const validation = validateFormTemplate(template);
    
    if (!validation.isValid) {
      throw new Error(`Invalid form template: ${validation.errors.join(', ')}`);
    }
    
    return template;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
};
