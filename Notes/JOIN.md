# Jak działa JOIN?

## Analogia — szuflady z karteczkami

Wyobraź sobie trzy szuflady:

```
[szuflada: users]         [szuflada: user_meals]      [szuflada: meals]
-----------------         ----------------------      ----------------
id: ABC  → dydol          id: 111                     id: XYZ → owsianka
id: DEF  → anna           user_id: ABC  ←────────── łączy z users.id
                          meal_id: XYZ  ────────────→ łączy z meals.id
                          date: 2026-02-25
```

`user_meals` to środkowa szuflada — ma karteczki które wskazują na obie inne szuflady.

---

## Jak czytać zapytanie JOIN

```sql
SELECT users.username, meals.name, user_meals.date
FROM user_meals
INNER JOIN users ON user_meals.user_id = users.id
INNER JOIN meals ON user_meals.meal_id = meals.id
```

Czytaj to po kolei:

1. `FROM user_meals`
   → "Zacznij od środkowej szuflady"

2. `INNER JOIN users ON user_meals.user_id = users.id`
   → "Weź kolumnę user_id z user_meals i znajdź pasujące id w users"
   → Czyli: user_meals.user_id = ABC → znajdź usera z id=ABC → to dydol

3. `INNER JOIN meals ON user_meals.meal_id = meals.id`
   → "Weź kolumnę meal_id z user_meals i znajdź pasujące id w meals"
   → Czyli: user_meals.meal_id = XYZ → znajdź posiłek z id=XYZ → to owsianka

4. `SELECT users.username, meals.name, user_meals.date`
   → "Z połączonych danych weź te trzy kolumny"

---

## Wynik

```
username  | name      | date
----------+-----------+------------
dydol     | owsianka  | 2026-02-25
```

---

## Zasada kciuka

`ON` zawsze łączy dwie kolumny które mówią o tym samym:
- `user_meals.user_id = users.id` → obie mówią o tym samym userze
- `user_meals.meal_id = meals.id` → obie mówią o tym samym posiłku

Lewa strona `ON` = tabela z foreign key
Prawa strona `ON` = tabela z primary key
