# Prisma CLI — komendy

## Migracje (zmiany w schemacie)

```bash
npx prisma migrate dev --name nazwa_migracji   # tworzy i aplikuje migrację (dev)
npx prisma migrate deploy                       # aplikuje migracje na produkcji
npx prisma migrate reset                        # resetuje bazę i aplikuje wszystko od nowa
npx prisma migrate status                       # sprawdza stan migracji
```

## Generowanie klienta

```bash
npx prisma generate    # regeneruje Prisma Client po zmianach w schema.prisma
```

> Po zmianie `schema.prisma`: `migrate dev` automatycznie woła też `generate`

## Podgląd danych

```bash
npx prisma studio    # GUI do przeglądania/edytowania danych w bazie
```

## Synchronizacja schematu (bez migracji)

```bash
npx prisma db push    # pushuje schemat bezpośrednio do bazy (bez pliku migracji)
                      # przydatne na wczesnym etapie prototypowania
npx prisma db pull    # pobiera schemat z istniejącej bazy do schema.prisma
```

---

## Typowy workflow przy zmianie modelu

1. Edytujesz `schema.prisma`
2. `npx prisma migrate dev --name co_zmieniłem`
3. Gotowe — klient też się zaktualizuje automatycznie
