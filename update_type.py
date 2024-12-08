import os
import json

def process_json_files(directory):
    allowed_usernames = {'system', 'admin', 'team'}  # Valores permitidos para username

    # Percorre todos os diretórios e subdiretórios
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.json'):  # Processa apenas arquivos .json
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as json_file:
                        data = json.load(json_file)
                    
                    # Verifica se o objeto login está presente
                    if 'login' in data and isinstance(data['login'], dict):
                        login = data['login']
                        username = login.get('username')

                        # Valida username: deve ser string e estar na lista permitida
                        if isinstance(username, str) and username in allowed_usernames:
                            if 'type' not in login:
                                login['type'] = username.capitalize()  # Adiciona o campo type
                            
                            # Salva as alterações de volta ao arquivo
                            with open(file_path, 'w', encoding='utf-8') as json_file:
                                json.dump(data, json_file, ensure_ascii=False, indent=2)
                        else:
                            # Se username não for válido, exibe o nome do arquivo
                            print(f"Inconsistência em {file_path}: username inválido ({username})")
                    
                except (json.JSONDecodeError, IOError, AttributeError) as e:
                    print(f"Erro ao processar o arquivo {file_path}: {e}")

# Diretório principal onde estão os mocks
mocks_directory = 'resources/mocks'
process_json_files(mocks_directory)
