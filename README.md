<p align="center">
  <a href="https://github.com/edrickleong/smartbank">
    <img src="src/assets/CronoPayLogo.svg" alt="Logo" width="120" height="120">
  </a>

<h3 align="center">CronoPay</h3>

<p align="center">
    Aplicación para llevar tus gastos e ingresos construida con React Native, Expo y Supabase. 
    <br />
    Desarrollada por <a href="https://github.com/jjgalindez">Jhon Galindez, Kedin Valencia, Jhonatan Tobar, Manuel Ruge, Jair Hoyos</a>
    <br />
    Demo app created by <a href="#">CronoTeam</a>
    <br />
    <br />
</p>

<p align="center">
  <img src="docs/images/mockupCronoPay.png" alt="Demo CronoPay" width="360" />
</p>

<p align="center">
  <img src="docs/images/App.gif" alt="Demo CronoPay" width="360" />
</p>

CronoPay es una aplicación de finanzas moderna construida con Expo, NativeWind y Supabase.  
Se enfoca en flujos de onboarding limpios, UI modular y estructura de proyecto mantenible.

---

## 📱 Flujos implementados

## 📱 Flujos implementados

- [x] Walkthrough / Carrusel de onboarding
- [x] Login with google and supabase auth
- [x] Configuración de cuenta
- [x] Pantalla principal
- [ ] Configuración de perfil

👉 Funcionalidades como **notificaciones notificaciones** aún no están implementadas.

---

## ✨ Funcionalidades

- [x] 🔒 Registro / Login (auth con Supabase y Google)
- [x] 🎨 Carrusel de onboarding con imágene
- [ ] 💸 HOME dentro de la app con los reportes (pendiente)

---

## 🔧 Construido con

- [Expo](https://expo.dev/) – Framework para apps en React Native
- [NativeWind](https://www.nativewind.dev/) – Tailwind CSS para React Native
- [Supabase](https://supabase.com/) – Plataforma de Auth y Base de Datos
- [Bun](https://bun.sh/) – Runtime y gestor de paquetes rápido
## 🚀 Local Development

---

## 🚀 Desarrollo local

### 1. Instalar Bun Windows
```sh
powershell -c "irm bun.sh/install.ps1|iex"

#### macOS
```sh
brew install bun
```
with NPM:

```shell
npm install -g bun
```
or Powershell:

```shell
powershell -c "irm bun.sh/install.ps1|iex"
```
1. Clone the repo

```sh
git clone https://github.com/jjgalindez/cronopay-app
```

3. Install NPM packages

```sh
bun install
```

4. Copy the `.env.example` file as a `.env` file and add the missing environment variables.
   
   You will need to sign up for a [Supabase account](https://supabase.com/) and create a project.
   You will need to update your Site URL under Authentication > URL Configuration > Site URL to
   `com.cronopay.app`.


5. Run the development server

```shell
bun start
```
