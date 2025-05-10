import os

def search_file(f_name):
    for path_, folders_, files_ in os.walk("C:\\Users\\User"):
        for item in files_:
            if item.endswith(f_name):
                print(path_+"\\"+item)

search_file(".pdf")