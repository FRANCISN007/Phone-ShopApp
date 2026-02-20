; =====================================================
;  ShopMan App Installer (Clean Production Version)
; =====================================================

#define MyAppName "ShopMan App"
#define MyAppVersion "2.5"
#define MyAppPublisher "School of Accounting Package"
#define MyAppURL "https://www.example.com/"
#define MyAppExeName "python.exe"

[Setup]
PrivilegesRequired=admin

; ✅ NEW UNIQUE APP ID (prevents mixing with old HEMS install)
AppId={{9E4B5F1A-8D7C-4A91-9F7E-2F6A9C1D55AA}}

AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; ✅ Clean install directory
DefaultDirName={autopf}\ShopManApp

DisableProgramGroupPage=yes
LicenseFile=C:\Users\KLOUNGE\Documents\PHONE_SHOP\license-shopman.txt

OutputDir=C:\Users\KLOUNGE\Desktop
OutputBaseFilename=ShopManAppInstaller
SetupIconFile=C:\Users\KLOUNGE\Documents\PHONE_SHOP\shopman-inst.ico

SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; Flags: unchecked  


; =====================================================
; FILES TO INSTALL
; =====================================================
[Files]

; Backend
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\app\*"; \
    DestDir: "{app}\app"; Flags: ignoreversion recursesubdirs createallsubdirs

; Backup folder
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\backup\*"; \
    DestDir: "{app}\backup"; Flags: ignoreversion recursesubdirs createallsubdirs

; React production build
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\react-frontend\build\*"; \
    DestDir: "{app}\react-frontend\build"; Flags: ignoreversion recursesubdirs createallsubdirs

; Embedded Python
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\python-embed\*"; \
    DestDir: "{app}\python"; Flags: ignoreversion recursesubdirs createallsubdirs

; Start script
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\start.py"; \
    DestDir: "{app}"; Flags: ignoreversion

; Environment file
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\.env"; \
    DestDir: "{app}"; Flags: ignoreversion


; =====================================================
; SHORTCUTS
; =====================================================
[Icons]

Name: "{autoprograms}\{#MyAppName}"; \
    Filename: "{app}\python\python.exe"; \
    Parameters: """{app}\start.py"""; \
    WorkingDir: "{app}"

Name: "{autodesktop}\{#MyAppName}"; \
    Filename: "{app}\python\python.exe"; \
    Parameters: """{app}\start.py"""; \
    WorkingDir: "{app}"; Tasks: desktopicon


; =====================================================
; POST-INSTALL ACTIONS
; =====================================================
[Run]

; ✅ Firewall rules for LAN access (RENAMED from HEMS)
Filename: "netsh"; \
    Parameters: "advfirewall firewall add rule name=""ShopMan-Backend"" dir=in action=allow protocol=TCP localport=8000"; \
    Flags: runhidden

Filename: "netsh"; \
    Parameters: "advfirewall firewall add rule name=""ShopMan-Frontend"" dir=in action=allow protocol=TCP localport=3000"; \
    Flags: runhidden

; ✅ Launch application after install
Filename: "{app}\python\{#MyAppExeName}"; \
    Parameters: """{app}\start.py"""; \
    WorkingDir: "{app}"; \
    Flags: nowait
