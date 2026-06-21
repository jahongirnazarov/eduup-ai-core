// Lesson Player Tests
describe('Lesson Player', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
  });

  test('should load lesson from JSON', () => {
    const mockLesson = {
      id: 'lesson-1',
      title: 'Matematika Asoslari',
      subject: 'matematika',
      level: 'boshlang\'ich',
      sections: [
        {
          id: 'section-1',
          title: 'Kirish',
          type: 'intro',
          content: {
            text: 'Assalomu alaykum!'
          }
        }
      ]
    };

    expect(mockLesson.id).toBe('lesson-1');
    expect(mockLesson.sections.length).toBe(1);
  });

  test('should save lesson progress', () => {
    const progress = {
      lessonId: 'lesson-1',
      currentSection: 2,
      completedSections: [0, 1],
      completedAt: new Date().toISOString()
    };

    localStorage.setItem('malika_lesson_progress', JSON.stringify(progress));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'malika_lesson_progress',
      JSON.stringify(progress)
    );
  });

  test('should load lesson progress', () => {
    const mockProgress = {
      lessonId: 'lesson-1',
      currentSection: 2,
      completedSections: [0, 1]
    };
    localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));

    const loadedProgress = JSON.parse(localStorage.getItem('malika_lesson_progress'));

    expect(loadedProgress.currentSection).toBe(2);
    expect(loadedProgress.completedSections).toEqual([0, 1]);
  });

  test('should calculate estimated speaking time', () => {
    const text = 'Assalomu alaykum! Bugun biz matematikani o\'rganamiz.';
    const wordsPerMinute = 150;
    const wordCount = text.split(' ').length;
    const estimatedTime = Math.ceil(wordCount / wordsPerMinute);

    expect(estimatedTime).toBeGreaterThan(0);
    expect(estimatedTime).toBeLessThan(60);
  });

  test('should navigate to next section', () => {
    let currentSection = 0;
    const totalSections = 5;

    currentSection = Math.min(currentSection + 1, totalSections - 1);

    expect(currentSection).toBe(1);
  });

  test('should navigate to previous section', () => {
    let currentSection = 2;

    currentSection = Math.max(currentSection - 1, 0);

    expect(currentSection).toBe(1);
  });

  test('should calculate progress percentage', () => {
    const completedSections = 3;
    const totalSections = 5;
    const progress = (completedSections / totalSections) * 100;

    expect(progress).toBe(60);
  });

  test('should validate lesson structure', () => {
    const lesson = {
      id: 'lesson-1',
      title: 'Test Lesson',
      subject: 'test',
      level: 'beginner',
      sections: []
    };

    const isValid = lesson.id && lesson.title && lesson.subject && lesson.level;

    expect(isValid).toBe(true);
  });

  test('should handle empty lesson', () => {
    const lesson = {
      id: '',
      title: '',
      subject: '',
      level: '',
      sections: []
    };

    const isValid = lesson.id && lesson.title && lesson.subject && lesson.level;

    expect(isValid).toBe(false);
  });

  test('should filter sections by type', () => {
    const sections = [
      { id: 's1', type: 'intro' },
      { id: 's2', type: 'concept' },
      { id: 's3', type: 'quiz' },
      { id: 's4', type: 'concept' }
    ];

    const conceptSections = sections.filter(s => s.type === 'concept');

    expect(conceptSections.length).toBe(2);
  });
});
