// Service worker de Underground: solo se encarga de recibir notificaciones
// push y mostrarlas, y de abrir la web al tocarlas. No cachea nada más.

self.addEventListener("push", (event) => {
  let datos = { title: "Underground", body: "Tienes algo nuevo en Underground", url: "/" };
  try {
    if (event.data) datos = { ...datos, ...event.data.json() };
  } catch (e) {
    // si el payload no es JSON, nos quedamos con los valores por defecto
  }

  event.waitUntil(
    self.registration.showNotification(datos.title, {
      body: datos.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: datos.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if ("focus" in cliente) return cliente.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
