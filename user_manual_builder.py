import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

SOURCE_DOC = r"E:\EMS Documents\atomy_india2_backup.docx"
TARGET_DOC = r"E:\EMS Documents\atomy_india2.docx"
SCREENSHOTS_DIR = r"c:\Users\Naveen\Desktop\Forge\Atomy_india\screenshots_manual"

def add_heading(doc, text, level):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    if level == 1:
        run.font.size = Pt(17)
        run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
    elif level == 2:
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(2, 132, 199) # Sky 600
    elif level == 3:
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(30, 41, 59) # Slate 800
    elif level == 4:
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(71, 85, 105) # Slate 600
    return p

def add_p(doc, text, bold_prefix=None, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.size = Pt(10)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    run = p.add_run(text)
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.size = Pt(9.5)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    run = p.add_run(text)
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_fig(doc, img_name, fig_num, caption):
    img_path = os.path.join(SCREENSHOTS_DIR, img_name)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(3)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(6.2))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(1)
        p_cap.paragraph_format.space_after = Pt(8)
        run_fig = p_cap.add_run(f"Figure {fig_num}: ")
        run_fig.bold = True
        run_fig.font.size = Pt(9.5)
        run_fig.font.color.rgb = RGBColor(2, 132, 199)
        run_desc = p_cap.add_run(caption)
        run_desc.italic = True
        run_desc.font.size = Pt(9.5)
        run_desc.font.color.rgb = RGBColor(100, 116, 139)
    else:
        print(f"ERROR: Image {img_name} not found!")

print("Loaded base builder.")
