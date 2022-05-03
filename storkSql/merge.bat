for /l %%i in (1,1,48) do (
	cd %%i
	copy * %%i.sql
	move %%i.sql C:\Users\admin\Documents\stork_data\storkSql\%%i.sql
	cd ..
)
cd ..
cd db
for /L %i in (1 1 48) do simpledb.exe --config=fs\sp.json --dbpath=fs\storkFS_%i.db --mode=execute --execute=execute_recordFS%i