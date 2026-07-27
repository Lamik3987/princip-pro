import urllib.request
import re

url = 'https://prpservis.ru/policy/'
try:
    with urllib.request.urlopen(url) as response:
        html = response.read().decode('utf-8')
        
    match = re.search(r'<div class="text-article-page__content typography">(.*?)</div>\s*</article>', html, re.DOTALL)
    if match:
        content = match.group(1)
        content = content.replace('Принцип-Сервис', 'Принцип-Про')
        content = content.replace('Принцип Сервис', 'Принцип-Про')
        content = content.replace('prpservis.ru', 'princip-pro.ru')
        
        with open(r'C:\princip-pro\about.html', 'r', encoding='utf-8') as f:
            about_html = f.read()
            
        header = about_html.split('<main>')[0]
        footer = about_html.split('</main>')[1]
        
        main_block = f'''
<main>
    <section class="page-header">
        <div class="container">
            <div class="breadcrumbs">
                <a href="index.html">Главная</a> <span>/</span> <span>Политика конфиденциальности</span>
            </div>
            <h1>Политика конфиденциальности</h1>
        </div>
    </section>
    <section class="section">
        <div class="container policy-content" style="max-width: 800px; margin: 0 auto; line-height: 1.6; font-size: 1.1rem; color: #333; padding: 40px 0;">
            {content}
        </div>
    </section>
</main>
'''
        with open(r'C:\princip-pro\policy.html', 'w', encoding='utf-8') as f:
            f.write(header + main_block + footer)
        print('Policy updated successfully using python!')
    else:
        print('Regex failed in python.')
except Exception as e:
    print('Error:', e)
