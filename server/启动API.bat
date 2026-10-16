@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 美丽修行 API · 3789
echo.
echo  正在启动 API（端口 3789）…
echo  保持本窗口打开；关闭即断开运营页数据库同步。
echo.
npm run dev
echo.
echo  服务已退出。按任意键关闭…
pause >nul
