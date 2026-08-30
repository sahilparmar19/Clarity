$proc = Start-Process cmd.exe -ArgumentList "/c `"C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat`" && set > msvc_env.txt" -Wait -NoNewWindow
