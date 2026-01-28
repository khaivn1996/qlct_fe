import { ref, watch, onMounted } from "vue";

export function useTheme() {
  const theme = ref<"dark" | "light">("dark");

  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }

  function setTheme(newTheme: "dark" | "light") {
    theme.value = newTheme;
  }

  watch(theme, (newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  onMounted(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      // Default to dark
      theme.value = "dark";
    }
    document.documentElement.setAttribute("data-theme", theme.value);
  });

  return {
    theme,
    toggleTheme,
    setTheme,
  };
}
