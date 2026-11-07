import { citizenServices, findService, searchServices, serviceGroups } from './citizenServices';

describe('citizen service catalogue', () => {
  test('contains unique, actionable services', () => {
    expect(citizenServices.length).toBeGreaterThanOrEqual(20);
    expect(new Set(citizenServices.map((service) => service.id)).size).toBe(citizenServices.length);
    expect(new Set(citizenServices.map((service) => service.slug)).size).toBe(citizenServices.length);

    citizenServices.forEach((service) => {
      expect(service.action?.en).toBeTruthy();
      expect(service.action?.bn).toBeTruthy();
      expect(service.result?.en).toBeTruthy();
      expect(service.result?.bn).toBeTruthy();
      expect(service.steps?.en?.length).toBeGreaterThanOrEqual(2);
      expect(service.steps?.bn?.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('organizes the services into everyday-need groups', () => {
    expect(serviceGroups.length).toBeGreaterThanOrEqual(5);
    serviceGroups.forEach((group) => {
      expect(citizenServices.filter((service) => service.group === group.id).length).toBeGreaterThan(0);
    });
  });

  test('supports English and Bangla search terms', () => {
    expect(searchServices('bus').map((service) => service.slug)).toContain('bus-finder');
    expect(searchServices('হাসপাতাল').map((service) => service.slug)).toContain('hospital-finder');
    expect(searchServices('ভাড়া', 'money').every((service) => service.group === 'money')).toBe(true);
  });

  test('supports stable deep links by slug or id', () => {
    expect(findService('route-planner')?.id).toBe(1);
    expect(findService(20)?.slug).toBe('official-alerts');
  });
});
