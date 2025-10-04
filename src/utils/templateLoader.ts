import JSZip from 'jszip';
import { DashboardTemplate, TemplateLoaderOptions, ChartComponent } from '../types/dashboard';

export class TemplateLoader {
  private templates: DashboardTemplate[] = [];

  async loadFromZip(options: TemplateLoaderOptions): Promise<DashboardTemplate[]> {
    try {
      const response = await fetch(options.zipFilePath);
      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const templateFiles = Object.keys(zip.files).filter(file =>
        file.endsWith('.json') && file.includes('template')
      );

      for (const fileName of templateFiles) {
        const file = zip.files[fileName];
        const content = await file.async('text');
        const templateData = JSON.parse(content);

        const template: DashboardTemplate = {
          id: options.autoGenerateIds ? this.generateId() : templateData.id || this.generateId(),
          name: templateData.name || 'Untitled Dashboard',
          description: templateData.description || '',
          category: options.category || templateData.category || 'general',
          tags: templateData.tags || [],
          layout: templateData.layout || { gridColumns: 12, gridRows: 8 },
          components: this.parseComponents(templateData.components || []),
          thumbnail: templateData.thumbnail,
          createdAt: new Date(templateData.createdAt || Date.now()),
          updatedAt: new Date(templateData.updatedAt || Date.now())
        };

        this.templates.push(template);
      }

      return this.templates;
    } catch (error) {
      console.error('Error loading templates from ZIP:', error);
      throw new Error(`Failed to load templates: ${error}`);
    }
  }

  private parseComponents(components: any[]): ChartComponent[] {
    return components.map((comp, index) => ({
      id: comp.id || `component-${index}`,
      type: comp.type || 'bar',
      title: comp.title || 'Untitled Chart',
      dataSource: comp.dataSource || '',
      config: comp.config || {},
      position: comp.position || { x: 0, y: 0, width: 6, height: 4 }
    }));
  }

  private generateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getTemplates(): DashboardTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): DashboardTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  getTemplatesByCategory(category: string): DashboardTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  getTemplatesByTags(tags: string[]): DashboardTemplate[] {
    return this.templates.filter(template =>
      tags.some(tag => template.tags.includes(tag))
    );
  }

  async loadMultipleZips(zipPaths: string[], options?: Partial<TemplateLoaderOptions>): Promise<DashboardTemplate[]> {
    const promises = zipPaths.map(zipPath =>
      this.loadFromZip({ ...options, zipFilePath: zipPath })
    );

    const results = await Promise.allSettled(promises);

    // Flatten results and filter out failed loads
    const allTemplates: DashboardTemplate[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allTemplates.push(...result.value);
      } else {
        console.warn('Failed to load template ZIP:', result.reason);
      }
    });

    this.templates = allTemplates;
    return allTemplates;
  }
}
