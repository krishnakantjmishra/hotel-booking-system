# Visual Project Structure (Complete & Exhaustive)

This document contains a visual map of **every single file** in your project, including configuration files and scripts.

## 1. Top Level & Backend Infrastructure

```mermaid
graph LR
    Root["📂 hotel-booking-system"]
    
    %% Root Files
    Root --> RootFiles["📄 Root Files"]
    RootFiles --- Req["requirements.txt"]
    RootFiles --- DocComp["docker-compose.yml"]
    RootFiles --- RunMD["RUN_PROJECT.md"]
    RootFiles --- UIMD["UI_IMPROVEMENTS.md"]
    RootFiles --- Log["logging_snippet.py"]
    RootFiles --- ProjDoc["PROJECT_DOCUMENTATION.md"]

    %% Backend
    Root --> Backend["📂 backend/"]
    
    %% Systemd (Infrastructure)
    Backend --> Sys["📂 systemd/"]
    Sys --- Guni["gunicorn.service"]
    Sys --- Fast["fastapi.service"]
    
    %% Scripts (Automation)
    Backend --> Scripts["📂 scripts/"]
    Scripts --- S_Setup["setup_s3.py"]
    Scripts --- S_TestB["test_booking.py"]
    Scripts --- S_TestTok["test_token.py"]
    
    %% Loose Utility Scripts (Root of Backend)
    Backend --> Utils["📂 (Root Scripts)"]
    Utils --- U_ChkHeic["check_heic_support.py"]
    Utils --- U_ChkImg["check_images.py"]
    Utils --- U_CmpUser["compare_users.py"]
    Utils --- U_CrAdm["create_admin.py"]
    Utils --- U_CrAdmQ["create_admin_quick.py"]
    Utils --- U_DbgLog["debug_login_issue.py"]
    Utils --- U_Deploy["deploy.sh"]
    Utils --- U_FixAdm["fix_admin_user.py"]
    Utils --- U_TstAdm["test_admin_login.py"]
    Utils --- U_TstImg["test_image_support.py"]
    Utils --- U_TstJwt["test_jwt_endpoint.py"]
    Utils --- U_TstLog["test_login_api.py"]
    Utils --- U_TstS3["test_s3.py"]
    Utils --- U_VerAdm["verify_and_fix_admin.py"]

    %% Backend Config Files
    Backend --- B_Manage["manage.py"]
    Backend --- B_Doc["Dockerfile"]
    Backend --- B_Req["requirements.txt"]
    Backend --- B_Env[".env"]
    Backend --- B_EnvEx[".env.example"]
    Backend --- B_Git[".gitignore"]
    Backend --- B_DockIg[".dockerignore"]
    
    style Root fill:#eee,stroke:#333
    style Backend fill:#e8f5e9,stroke:#4caf50
    style Sys fill:#ffe0b2,stroke:#ff9800
    style Scripts fill:#ffe0b2,stroke:#ff9800
    style Utils fill:#ffe0b2,stroke:#ff9800
```

---

## 2. Django Apps (Business Logic)

```mermaid
graph LR
    Backend["📂 backend/"]

    %% Core App
    Backend --> Core["📂 core/"]
    Core --- C_Set["settings.py"]
    Core --- C_Urls["urls.py"]
    Core --- C_Wsgi["wsgi.py"]
    Core --- C_Asgi["asgi.py"]
    Core --- C_Init["__init__.py"]

    %% Hotels App
    Backend --> Hotels["📂 hotels/"]
    Hotels --- H_Mod["models.py"]
    Hotels --- H_Views["views.py"]
    Hotels --- H_Urls["urls.py"]
    Hotels --- H_Ser["serializers.py"]
    Hotels --- H_AdmViews["admin_views.py"]
    Hotels --- H_AdmUrls["admin_urls.py"]
    Hotels --- H_Bulk["bulk_inventory_serializer.py"]
    Hotels --- H_ImgMod["image_models.py"]
    Hotels --- H_ImgSer["image_serializers.py"]
    Hotels --- H_ImgViews["image_views.py"]
    Hotels --- H_Pag["pagination.py"]
    Hotels --- H_Admin["admin.py"]
    Hotels --- H_Apps["apps.py"]
    Hotels --- H_Tests["tests.py"]
    Hotels --- H_Mig["📂 migrations/"]

    %% Bookings App
    Backend --> Bookings["📂 bookings/"]
    Bookings --- B_Mod["models.py"]
    Bookings --- B_Views["views.py"]
    Bookings --- B_Ser["serializers.py"]
    Bookings --- B_Urls["urls.py"]
    Bookings --- B_Admin["admin.py"]
    Bookings --- B_Apps["apps.py"]
    Bookings --- B_Tests["tests.py"]
    Bookings --- B_Mig["📂 migrations/"]
    
    %% Users App
    Backend --> Users["📂 users/"]
    Users --- U_Mod["models.py"]
    Users --- U_Views["views.py"]
    Users --- U_Ser["serializers.py"]
    Users --- U_Urls["urls.py"]
    Users --- U_Admin["admin.py"]
    Users --- U_Apps["apps.py"]
    Users --- U_Tests["tests.py"]
    Users --- U_Sig["signals.py"]
    Users --- U_Mig["📂 migrations/"]
    
    style Backend fill:#e8f5e9,stroke:#4caf50
    style Hotels fill:#c8e6c9,stroke:#4caf50
    style Bookings fill:#c8e6c9,stroke:#4caf50
    style Users fill:#c8e6c9,stroke:#4caf50
    style Core fill:#c8e6c9,stroke:#4caf50
```

---

## 3. Frontend Application

```mermaid
graph LR
    Frontend["📂 frontend/"]
    
    %% Configuration
    Frontend --- F_Pack["package.json"]
    Frontend --- F_Lock["package-lock.json"]
    Frontend --- F_Wait["deploy-frontend.sh"]
    Frontend --- F_Nginx["nginx.conf"]
    Frontend --- F_Dock["Dockerfile"]
    Frontend --- F_Git[".gitignore"]
    Frontend --- F_Env[".env"]
    
    %% Public Assets
    Frontend --> Public["📂 public/"]
    Public --- P_Ind["index.html"]
    Public --- P_Rob["robots.txt"]
    Public --- P_Fav["favicon.ico"]
    Public --- P_Man["manifest.json"]
    
    %% Source Code
    Frontend --> Src["📂 src/"]
    
    %% Pages
    Src --> Pages["📂 pages/"]
    Pages --- Pg_Home["Home.js"]
    Pages --- Pg_Hotels["Hotels.js"]
    Pages --- Pg_Det["HotelDetail.js"]
    Pages --- Pg_Log["Login.js"]
    Pages --- Pg_Reg["Register.js"]
    Pages --- Pg_MyB["MyBookings.js"]
    
    subgraph Admin_Pages [Admin Dashboard]
        Pages --- Pg_ADash["AdminDashboard.js"]
        Pages --- Pg_AHot["AdminHotels.js"]
        Pages --- Pg_ARoom["AdminRooms.js"]
        Pages --- Pg_AInv["AdminInventory.js"]
        Pages --- Pg_ABook["AdminBookings.js"]
        Pages --- Pg_ALog["AdminLogin.js"]
    end
    
    %% Components
    Src --> Comp["📂 components/"]
    Comp --- Cm_Nav["Navbar.js"]
    Comp --- Cm_Foot["Footer.js"]
    Comp --- Cm_Load["Loader.js"]
    Comp --- Cm_Slide["ImageSlider.js"]
    Comp --- Cm_Img["ImageManager.js"]
    Comp --- Cm_Prt["ProtectedRoute.js"]
    Comp --- Cm_Adm["AdminRoute.js"]
    Comp --- Cm_Anav["AdminNav.js"]
    Comp --- Cm_Non["NonAdminRoute.js"]
    
    %% Context & API
    Src --> Ctx["📂 context/"]
    Ctx --- Ctx_Auth["AuthContext.js"]
    
    Src --> Api["📂 api/"]
    Api --- Api_Ax["axios.js"]
    
    %% Main
    Src --- App["App.js"]
    Src --- Ind["index.js"]
    Src --- CSS["App.css"]
    Src --- ICSS["index.css"]
    Src --- Rep["reportWebVitals.js"]
    Src --- Set["setupTests.js"]

    style Frontend fill:#e1f5fe,stroke:#03a9f4
    style Public fill:#b3e5fc,stroke:#03a9f4
    style Src fill:#b3e5fc,stroke:#03a9f4
```

---

## 4. Microservices & Nginx

```mermaid
graph TD
    Root["📂 hotel-booking-system"]

    %% Microservices
    Root --> Micro["📂 microservices/"]
    Micro --> Avail["📂 availability_service/"]
    Avail --- M_Main["main.py"]
    Avail --- M_Conf["config.py"]
    Avail --- M_DB["database.py"]
    Avail --- M_Mod["models.py"]
    Avail --- M_Sche["schemas.py"]
    Avail --- M_Dock["Dockerfile"]
    Avail --- M_Req["requirements.txt"]
    Avail --- M_Env[".env"]
    Avail --- M_Init["__init__.py"]

    %% Nginx
    Root --> Nginx["📂 nginx/"]
    Nginx --- N_Conf["django.conf (Main Proxy Config)"]
    Nginx --- N_Doc["Dockerfile"]
    
    style Micro fill:#fff3e0,stroke:#ff9800
    style Nginx fill:#f3e5f5,stroke:#9c27b0
```
