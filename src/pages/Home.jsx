import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import categoriesData from "../data/categories.json";
import lessonsData from "../data/lessons.json";

const CATEGORIES_CACHE_KEY = "categoriesCache";

export default function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories and lessons from local JSON
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const categories = categoriesData.map((category) => ({
        ...category,
        lessons: lessonsData.filter((l) => l.categoryId === category.id),
      }));
      setCategories(categories);
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories));
    } catch (err) {
      const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setCategories(parsed);
          setError(null);
          setLoading(false);
          return;
        } catch {
          // ignore cache parse errors
        }
      }
      setError(err?.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartLesson = (lessonId) => {
    navigate(`/practice?lessonId=${lessonId}`);
  };

  // States
  if (loading) return <MainLayout>Loading categories...</MainLayout>;
  if (error) return <MainLayout>Error: {error}</MainLayout>;
  if (categories.length === 0)
    return <MainLayout>No categories found.</MainLayout>;

  return (
    <MainLayout>
      <h2 className="page-title">انتخاب درس</h2>
      <p className="page-subtitle">یک درس انتخاب کن و تمرین را شروع کن.</p>

      {categories.map((category) => (
        <div key={category.id} className="card">
          <div className="card-header">
            <h3>{category.name}</h3>
            <span className="muted">{category.lessons?.length || 0} درس</span>
          </div>
          <div className="lesson-grid">
            {category.lessons?.length > 0 ? (
              category.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => handleStartLesson(lesson.id)}
                  className="lesson-btn"
                >
                  {lesson.name}
                </button>
              ))
            ) : (
              <p style={{ fontStyle: "italic" }}>No lessons in this category</p>
            )}
          </div>
        </div>
      ))}
    </MainLayout>
  );
}
