import { purchaseRequestTemplate } from './purchaseRequestTemplate';

export const templates = {
  purchase_request: purchaseRequestTemplate,
};

export const getTemplateCategories = () => {
  const categories = new Set();
  Object.values(templates).forEach(template => {
    if (template.category) {
      categories.add(template.category);
    }
  });
  return Array.from(categories);
};

export const getTemplatesByCategory = (category) => {
  return Object.values(templates).filter(template => template.category === category);
};

export const getAllTemplates = () => Object.values(templates); 