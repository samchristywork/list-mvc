#!/bin/bash

cp scripts/prelude.html out.html

{
echo "<body><table>"
printf '.headers on\nselect * from items;' | sqlite3 db/lists.db -html
echo "</table><br><br><table>"
printf '.headers on\nselect * from lists;' | sqlite3 db/lists.db -html
echo "</table></body></html>"
} >> out.html
