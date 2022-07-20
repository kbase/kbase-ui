# 1k file
def main():
    import sys

    some_k = sys.argv[1]

    with open(f'{some_k}k.txt', 'w') as fout:
        for i in range(0, int(some_k)*1000):
            fout.write('A')


main()