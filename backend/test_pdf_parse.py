import sys
from xhtml2pdf import pisa

css_1 = """
@page {
    size: letter;
    margin: 2cm 2cm 2.5cm 2cm;
}
"""

html_content = f"""<!DOCTYPE html>
<html>
<head>
  <style>{{css_1}}</style>
</head>
<body>
  <h1>Test</h1>
</body>
</html>"""

with open("test.pdf", "w+b") as f:
    pisa_status = pisa.CreatePDF(html_content, dest=f)
    print("Success! Error code:", pisa_status.err)
