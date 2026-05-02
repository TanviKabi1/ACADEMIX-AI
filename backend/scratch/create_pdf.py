from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="This is a test PDF for Academix AI.", ln=1, align='C')
pdf.cell(200, 10, txt="It contains information about Machine Learning.", ln=2, align='C')
pdf.output("test_pdf.pdf")
