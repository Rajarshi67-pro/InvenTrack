INSERT INTO USERS
(
USER_ID,
FULL_NAME,
EMAIL,
PASSWORD_HASH,
ROLE
)

VALUES
(
USER_SEQ.NEXTVAL,
'Admin',
'admin@inventory.com',
'admin123',
'ADMIN'
);
COMMIT;