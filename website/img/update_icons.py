import webruntime

sizes = 16, 32, 64, 128, 256

icon = webruntime.util.icon.Icon()
for size in sizes:
    fname = f"faqdivlogo{size}.png"
    icon.read(fname)

icon.write(f"favicon.ico")
