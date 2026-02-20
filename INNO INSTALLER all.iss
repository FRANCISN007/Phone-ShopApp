#define MyAppName "SHopMan App"
#define MyAppVersion "2.5"
#define MyAppPublisher "School of Accounting Package"

[Setup]
PrivilegesRequired=admin
AppId={{7C26CBC0-0FD9-4943-9A21-2204ED49422F}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\PHONE_SHOP
DisableProgramGroupPage=yes
LicenseFile=C:\Users\KLOUNGE\Documents\PHONE_SHOP\license-shopman.txt
OutputDir=C:\Users\KLOUNGE\Desktop
OutputBaseFilename=PHONE_SHOP
SetupIconFile=C:\Users\KLOUNGE\Documents\PHONE_SHOP\shopman-inst.ico
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\python\python.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\app\*"; DestDir: "{app}\app"; Flags: recursesubdirs createallsubdirs
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\react-frontend\build\*"; DestDir: "{app}\react-frontend\build"; Flags: recursesubdirs createallsubdirs
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\backup\*"; DestDir: "{app}\backup"; Flags: recursesubdirs createallsubdirs
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\python-embed\*"; DestDir: "{app}\python"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\requirements.txt"; DestDir: "{app}"
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\get-pip.py"; DestDir: "{app}"
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\start.py"; DestDir: "{app}"
Source: "C:\Users\KLOUNGE\Documents\PHONE_SHOP\.env"; DestDir: "{app}"; Flags: ignoreversion

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked  



[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\python\python.exe"; Parameters: """{app}\start.py"""; WorkingDir: "{app}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\python\python.exe"; Parameters: """{app}\start.py"""; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
; ✅ Firewall rules for LAN access
Filename: "netsh"; Parameters: "advfirewall firewall add rule name=""HEMS-Backend"" dir=in action=allow protocol=TCP localport=8000"; Flags: runhidden
Filename: "netsh"; Parameters: "advfirewall firewall add rule name=""HEMS-Frontend"" dir=in action=allow protocol=TCP localport=3000"; Flags: runhidden



[Code]

var
  InstallOK: Boolean;

function PipExists(): Boolean;
begin
  Result := FileExists(ExpandConstant('{app}\python\Scripts\pip.exe'));
end;

function RequirementsInstalled(): Boolean;
var
  ResultCode: Integer;
begin
  Exec(
    ExpandConstant('{app}\python\python.exe'),
    '-m pip check',
    '',
    SW_HIDE,
    ewWaitUntilTerminated,
    ResultCode
  );
  Result := ResultCode = 0;
end;

procedure Rollback();
begin
  MsgBox(
    'Dependency installation failed. Rolling back installation.',
    mbCriticalError,
    MB_OK
  );
  DelTree(ExpandConstant('{app}'), True, True, True);
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    InstallOK := True;

    WizardForm.StatusLabel.Caption := 'Configuring embedded Python...';
    Exec('cmd.exe', '/C echo import site>>"{app}\python\python._pth"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);

    if not PipExists() then
    begin
      WizardForm.StatusLabel.Caption := 'Installing pip...';
      if not Exec(
        ExpandConstant('{app}\python\python.exe'),
        ExpandConstant('"{app}\get-pip.py"'),
        '',
        SW_HIDE,
        ewWaitUntilTerminated,
        ResultCode
      ) then InstallOK := False;
    end;

    if InstallOK and not RequirementsInstalled() then
    begin
      WizardForm.StatusLabel.Caption := 'Installing application dependencies...';
      if not Exec(
        ExpandConstant('{app}\python\python.exe'),
        ExpandConstant('-m pip install -r "{app}\requirements.txt"'),
        '',
        SW_HIDE,
        ewWaitUntilTerminated,
        ResultCode
      ) then InstallOK := False;
    end;

    if not InstallOK then
    begin
      Rollback();
      Abort();
    end;

    WizardForm.StatusLabel.Caption := 'Starting application...';
    Exec(
      ExpandConstant('{app}\python\python.exe'),
      ExpandConstant('"{app}\start.py"'),
      '',
      SW_SHOW,
      ewNoWait,
      ResultCode
    );
  end;
end;
