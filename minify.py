
def minify(text):
    lines = text.splitlines()
    lines = [line.split("//")[0].strip() for line in lines]
    lines = [line for line in lines if line]
    return " ".join(lines)

text1 = open("faq-this.js", "rb").read().decode()
text2 = minify(text1)
with open("faq-this.min.js", "wb") as f:
    f.write(text2.encode())
print("minified js from ", len(text1), "to", len(text2), "bytes")

text1 = open("faq-this.css", "rb").read().decode()
text2 = minify(text1)
with open("faq-this.min.css", "wb") as f:
    f.write(text2.encode())
print("minified css from ", len(text1), "to", len(text2), "bytes")
