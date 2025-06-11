import json
import sys

# compile Tiptap JSON output to a subset of LaTeX.

def compile(ast):
    if type(ast) == list:
        return compile_list(ast)
    if type(ast) == dict:
        return compile_dict(ast)
    return ast

def compile_list(l: list):
    return ''.join([compile(a) for a in l])

def compile_dict(d: dict):
    if d['type'] in ['doc', 'paragraph']:
        return compile_list(d['content'])
    
    if d['type'] != 'text':
        raise ValueError('bad dict')
    
    if 'marks' not in d:
        return d['text']
    
    stylist = style(d['marks'])
    return stylist(d['text'])

def style(marks):
    if type(marks) == list:
        return style_list(marks)
    
    if type(marks) != dict:
        raise ValueError("bad input :(")
    
    table = {
        'link': style_link,
        'bold': style_bold,
        'italic': style_italic,
        'underline': style_underline
    }

    return table[marks['type']](marks)

def style_bold(mark):
    return lambda text: f'\\textbf{{{text}}}'

def style_italic(mark):
    return lambda text: f'\\textit{{{text}}}'

def style_underline(mark):
    return lambda text: f'\\underline{{{text}}}'

def style_link(mark):
    return lambda text: f'\\href{{{mark['attrs']['href']}}}{{{text}}}'

def style_list(marks):
    def stylist(text):
        out = text
        for mark in marks:
            s = style(mark)
            out = s(out)
        return out
    return stylist

if __name__ == '__main__':
    try:
        string = sys.stdin.read()
        ast = json.loads(string)
        print(compile(ast))
    except Exception as e:
        print("oops")