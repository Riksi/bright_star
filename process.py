import json
import re

def process(file):
    with open(file) as f:
        text = f.readlines()
        # only strip at end since we want to preserve the indentation
        text = [line.rstrip() for line in text]
        text = filter(None, text)
        # Format of text is 
        # title
        # BY <author>
        # author_url
        # <poem>
        # Glossary with line references:
        title, by, by_url, *rest = text
        by = by.replace('BY ', '').strip()
        heading_idx = rest.index('Glossary with line references:')
        poem = rest[:heading_idx]
        glossary = rest[heading_idx+1:]
        # This is then followed by a list of glossary terms, each on a separate line
        # which has the format <term>: <definition> (line <line number>)
        # Make glossary that is a dictionary with line numbers as keys
        # Each line number is associated with a list of tuples
        # Each tuple has the format (<term>, <definition>)
        gloss_dict = {}
        regex = re.compile(r'(.+): (.+) \(line (\d+)\)')
        for gloss_line in glossary:
            match = regex.match(gloss_line)
            assert match is not None, f'Line {gloss_line} does not match regex'
            term, definition, line_num = match.groups()
            line_num = int(line_num)
            

            if line_num > len(poem) or term not in poem[line_num-1]:
                # line_num might be incorrect, so check all lines, starting from next line
                for idx in range(len(poem)):
                    if term in poem[idx]:
                        line_num = idx + 1
                        break
            
            assert term in poem[line_num-1], f'Term {term} not found in poem'
            if line_num not in gloss_dict:
                gloss_dict[line_num] = []
            start = poem[line_num-1].find(term)
            end = start + len(term)
            gloss_dict[line_num].append((start, end, term, definition))

        # sort each list of tuples by start index
        gloss_dict = {k: sorted(v) for k, v in gloss_dict.items()}

        data = {
            'title': title,
            'by': by,
            'by_url': by_url,
            'poem': poem,
            'glossary': gloss_dict,
        }
    with open('data.js', 'w') as f:
        f.write(f'const data = {json.dumps(data, indent=4)}')




if __name__ == "__main__":
    process('text.txt')
