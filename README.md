# Lite Browser

<div align="center">

![Lite Browser](https://img.shields.io/badge/Lite%20Browser-v1.0.0-blue?style=for-the-badge)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**A lightweight, minimalistic web browser built with Rust and Tauri**

*Fast. Lightweight. Minimal.*

</div>

---

## ✨ Features

- 🚀 **Lightweight** - Uses system WebView (WebView2 on Windows, WebKitGTK on Linux)
- 🎨 **Dark Theme** - Beautiful minimalistic dark UI
- 📑 **Tab Management** - Create, close, and switch between tabs
- ⌨️ **Keyboard-First** - Full keyboard navigation support
- 🔍 **Quick Search** - Press `Ctrl+Space` for instant search overlay
- 📌 **Smart Sidebar** - Auto-hides when browsing, appears on hover
- 🔗 **Quick Links** - Customizable shortcuts (YouTube, ChatGPT, GitHub, etc.)
- 🪟 **Custom Titlebar** - Integrated controls with sidebar toggle

## 📸 Screenshots

| Welcome Screen | Browsing |
|:-:|:-:|
| Quick links & search | Embedded webview with smart sidebar |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Space` | Open quick search (new tab) |
| `Ctrl + T` | New tab |
| `Ctrl + W` | Close current tab |
| `Ctrl + L` | Focus URL bar |
| `Ctrl + R` / `F5` | Reload page |
| `Escape` | Close search / hide sidebar |

## 🛠️ Tech Stack

- **Backend**: Rust + Tauri v2
- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Dark theme)
- **Web Engine**: System WebView (WebView2/WebKitGTK)

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (latest stable)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Windows Additional Requirements
- WebView2 Runtime (usually pre-installed on Windows 10/11)

### Linux Additional Requirements
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel

# Arch
sudo pacman -S webkit2gtk-4.1 gtk3 libappindicator-gtk3
```

### Build from Source

```bash
# Clone the repository
git clone https://github.com/bittu-the-coder/lite-browser.git
cd lite-browser

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## 🏗️ Project Structure

```
lite-browser/
├── src/                    # React frontend
│   ├── App.jsx             # Main application component
│   ├── App.css             # Styles
│   └── main.jsx            # Entry point
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs          # Core browser logic
│   │   └── main.rs         # Entry point
│   ├── capabilities/       # Tauri permissions
│   └── Cargo.toml          # Rust dependencies
├── index.html              # HTML entry
└── package.json            # Node dependencies
```

## 🎯 Architecture

```
┌─────────────────────────────────────────────┐
│                 Lite Browser                 │
├─────────────────────────────────────────────┤
│  React UI (Sidebar, Tabs, Controls)         │
├─────────────────────────────────────────────┤
│  Tauri IPC Bridge                           │
├─────────────────────────────────────────────┤
│  Rust Backend (Navigation, Tab Management)  │
├─────────────────────────────────────────────┤
│  Native WebView (WebView2 / WebKitGTK)      │
└─────────────────────────────────────────────┘
```

## 🚀 Roadmap

### Version 1.x (Current)
- [x] Basic navigation
- [x] Tab management
- [x] Quick links
- [x] Smart sidebar
- [x] Custom titlebar
- [ ] Bookmarks
- [ ] History panel
- [ ] Settings page

### Version 2.0 (Planned)
A complete rewrite for Zed-level performance:
- Pure Rust (no JavaScript)
- GPU-accelerated UI (wgpu/GPUI-style)
- <100MB RAM usage
- <300ms startup
- Native WebView embedding via FFI

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing framework
- [Zed](https://zed.dev/) - Inspiration for performance goals
- The Rust community

---

<div align="center">

**Made with ❤️ and Rust**

[Report Bug](https://github.com/YOUR_USERNAME/lite-browser/issues) · [Request Feature](https://github.com/YOUR_USERNAME/lite-browser/issues)

</div>
