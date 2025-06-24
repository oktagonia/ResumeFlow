import sys
import json
import compile as c


def get_latex(sections):
    with open('template.tex') as f:
        template = f.read()

    content = ''.join([get_latex_section(section)
                      for section in sections if section['status']])
    return template.replace('%[[[INSERT CONTENT HERE]]]%', content)


def get_latex_section(section):
    if section['type'] == 'LaTeX':
        return section['title']

    title = c.compile(section['json'])
    latex = f'\\section{{{title}}}\n'

    if not section['items']:
        return latex

    latex += '\\resumeSubHeadingListStart\n'
    latex += ''.join([get_latex_item(item)
                     for item in section['items'] if item['status']])
    latex += '\\resumeSubHeadingListEnd\n'

    return latex


def get_latex_item(item):
    start_date = item['startDate']
    end_date = item['endDate']
    date = f'{start_date}---{end_date}' if start_date and end_date else ''
    location = item['location']
    organization = c.compile(item['organizationJSON'])
    title = c.compile(item['titleJSON'])

    latex = f'\\resumeSubheading{{{title}}}{{{date}}}{{{organization}}}{{{location}}}\n'

    if not item['bulletPoints']:
        return latex

    latex += '\\resumeItemListStart\n'
    latex += ''.join([get_latex_bullet(bullet)
                     for bullet in item['bulletPoints'] if bullet['status']])
    latex += '\\resumeItemListEnd\n'

    return latex


def get_latex_bullet(bullet):
    content = c.compile(bullet['json'])
    return f'\\resumeItem{{{content}}}\n'


if __name__ == '__main__':
    try:
        string = sys.stdin.read()
        sections = json.loads(string)
        print(get_latex(sections))
    except Exception as e:
        print('oops')
