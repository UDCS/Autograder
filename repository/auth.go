package repository

import (
	"net/mail"

	"github.com/UDCS/Autograder/models"
)

func (store PostgresStore) GetUserInfo(email mail.Address) (models.User, error) {
	var user models.User
	err := store.db.Get(
		&user,
		"SELECT id, name, email, password_hash, password_salt, user_role, created_at, updared_at FROM users WHERE email = $1;",
		email,
	)

	return user, err
}
