flowchart TB
    subgraph config["Configuração"]
        FCFG["config/fortify.php<br/>Features::registration() + emailVerification()"]
        PROV["bootstrap/providers.php<br/>regista FortifyServiceProvider"]
    end

    subgraph views_fortify["Views Fortify → Inertia"]
        FSP["app/Providers/FortifyServiceProvider.php<br/>registerView / verifyEmailView"]
        REGUI["resources/js/pages/auth/register.tsx<br/>Form → store.form() Wayfinder"]
        VRFUI["resources/js/pages/auth/verify-email.tsx<br/>Form → send.form() Wayfinder"]
    end

    subgraph register_action["Criação do utilizador"]
        CNU["app/Actions/Fortify/CreateNewUser.php<br/>Validator + User::create()"]
        UMDL["app/Models/User.php<br/>implements MustVerifyEmail"]
        MIG["database/migrations/..._create_users_table.php<br/>email_verified_at"]
    end

    subgraph fortify_pkg["Laravel Fortify pacote vendor"]
        FTREG["POST /register<br/>controller Fortify"]
        FTVRF["GET email/verify → verification.notice"]
        FTSND["POST email/verification-notification → verification.send"]
        FTCLK["GET email/verify/{id}/{hash} → verification.verify"]
    end

    subgraph framework["Laravel framework"]
        EVT["Evento Registered<br/>+ envio VerifyEmail<br/>(notificação Illuminate)"]
        MW["Middleware verified<br/>em routes protegidas"]
    end

    subgraph routes_app["Rotas da app"]
        WEB["routes/web.php<br/>auth + verified no dashboard etc."]
    end

    FCFG --> PROV
    PROV --> FSP
    FSP --> REGUI
    FSP --> VRFUI

    REGUI -->|POST register| FTREG
    FTREG --> CNU
    CNU --> UMDL
    UMDL -.->|persiste| MIG
    FTREG --> EVT
    EVT -->|e-mail com link assinado| FTCLK

    FTREG -->|login + redirect típico| FTVRF
    FTVRF --> VRFUI

    VRFUI -->|reenviar| FTSND
    FTSND --> EVT

    FTCLK -->|marca email_verified_at| UMDL
    FTCLK -->|redirect ex.: dashboard?verified=1| WEB
    WEB --> MW
    MW -->|não verificado| FTVRF
