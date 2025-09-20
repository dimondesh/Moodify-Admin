import React, { useEffect, useState } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuthStore } from "../stores/useAuthStore";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Эта функция "ловит" результат после того, как пользователь вернется со страницы входа Google.
    // onAuthStateChanged сработает после этого и обработает данные пользователя.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // Если есть результат, значит, пользователь только что вошел в систему.
          // Показываем индикатор загрузки, пока onAuthStateChanged проверяет его данные.
          toast.loading("Проверка данных...", { id: "auth-toast" });
        }
      })
      .catch((error) => {
        console.error("Ошибка при обработке редиректа Google:", error);
        toast.error("Не удалось войти через Google.");
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Этот слушатель срабатывает при любой смене состояния аутентификации.
      if (firebaseUser) {
        try {
          // Получаем токен для аутентификации на нашем бэкенде.
          const token = await firebaseUser.getIdToken();

          // Отправляем запрос к нашему API для проверки статуса админа.
          // Этот роут защищен admin.middleware.js, который мы создали.
          const response = await axiosInstance.get("/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userData = response.data;

          // Если бэкенд подтвердил, что пользователь - админ:
          if (userData && userData.isAdmin) {
            setUser(userData);
            toast.dismiss("auth-toast");
          } else {
            // Если пользователь не админ, показываем ошибку и выкидываем его.
            toast.error(
              "Доступ запрещен. Учетная запись не является администратором.",
              { id: "auth-toast" }
            );
            await logout(); // Используем logout из стора, который вызывает firebaseSignOut
          }
        } catch (error) {
          console.error("Ошибка верификации админа:", error);
          if (error instanceof AxiosError && error.code === "ERR_NETWORK") {
            toast.error(
              "Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен.",
              { id: "auth-toast" }
            );
          } else {
            toast.error("Ошибка аутентификации. Попробуйте еще раз.", {
              id: "auth-toast",
            });
          }
          await logout();
        }
      } else {
        // Если firebaseUser отсутствует, значит, пользователь не вошел в систему.
        setUser(null);
      }
      // Завершаем начальную загрузку.
      setLoading(false);
    });

    // Отписываемся от слушателя при размонтировании компонента.
    return () => unsubscribe();
  }, [setUser, logout]);

  // Пока идет проверка, показываем глобальный лоадер.
  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <Loader2 className="size-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  // Когда проверка завершена, показываем дочерние компоненты (всю админку).
  return <>{children}</>;
};

export default AuthProvider;
