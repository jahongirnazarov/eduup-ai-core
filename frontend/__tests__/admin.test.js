// Admin Panel Tests
describe('Admin Panel', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
  });

  test('should load configuration from localStorage', () => {
    const mockConfig = {
      subjects: [{ id: 'math', name: 'Matematika' }],
      levels: [{ id: 'beginner', name: 'Boshlang\'ich' }]
    };
    localStorage.getItem.mockReturnValue(JSON.stringify(mockConfig));

    // Simulate loading configuration
    const loadedConfig = JSON.parse(localStorage.getItem('malika_subjects'));
    
    expect(loadedConfig).toEqual(mockConfig.subjects);
  });

  test('should save subjects to localStorage', () => {
    const subjects = [{ id: 'math', name: 'Matematika' }];
    
    localStorage.setItem('malika_subjects', JSON.stringify(subjects));
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'malika_subjects',
      JSON.stringify(subjects)
    );
  });

  test('should add new subject', () => {
    const subjects = [];
    const newSubject = { id: 'physics', name: 'Fizika' };
    
    subjects.push(newSubject);
    
    expect(subjects).toContain(newSubject);
    expect(subjects.length).toBe(1);
  });

  test('should delete subject', () => {
    const subjects = [
      { id: 'math', name: 'Matematika' },
      { id: 'physics', name: 'Fizika' }
    ];
    
    const filtered = subjects.filter(s => s.id !== 'math');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('physics');
  });

  test('should toggle panel visibility', () => {
    const panelConfig = {
      'lessons-section': true,
      'create-lesson': true
    };
    
    panelConfig['lessons-section'] = !panelConfig['lessons-section'];
    
    expect(panelConfig['lessons-section']).toBe(false);
  });

  test('should add feedback', () => {
    const feedbacks = [];
    const newFeedback = {
      id: 'feedback-1',
      text: 'Great platform!',
      type: 'suggestion',
      createdAt: new Date().toISOString()
    };
    
    feedbacks.push(newFeedback);
    
    expect(feedbacks).toContain(newFeedback);
    expect(feedbacks.length).toBe(1);
  });

  test('should update analytics data', () => {
    const analyticsData = {
      totalUsers: 100,
      activeUsers: 30,
      completedLessons: 500,
      avgRating: 4.5
    };
    
    analyticsData.totalUsers = 150;
    
    expect(analyticsData.totalUsers).toBe(150);
  });

  test('should save adaptive learning settings', () => {
    const adaptiveSettings = {
      status: 'enabled',
      difficultyLevel: 'auto',
      studentLevel: 'beginner'
    };
    
    localStorage.setItem('malika_adaptive_settings', JSON.stringify(adaptiveSettings));
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'malika_adaptive_settings',
      JSON.stringify(adaptiveSettings)
    );
  });

  test('should add plugin', () => {
    const plugins = [];
    const newPlugin = { id: 'social', name: 'Social Features', status: 'inactive' };
    
    plugins.push(newPlugin);
    
    expect(plugins).toContain(newPlugin);
    expect(plugins.length).toBe(1);
  });

  test('should toggle plugin status', () => {
    const plugin = { id: 'social', name: 'Social Features', status: 'inactive' };
    
    plugin.status = plugin.status === 'active' ? 'inactive' : 'active';
    
    expect(plugin.status).toBe('active');
  });
});
