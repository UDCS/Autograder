package config

import (
	"strings"
	"sync"
	"time"

	"github.com/spf13/viper"
)

type (
	Config struct {
		Server *Server
		Db     *Db
		Auth   *Auth
	}

	Server struct {
		Port string
	}

	Db struct {
		Host     string
		Port     string
		User     string
		Password string
		DBName   string
		SslMode  string
	}

	Auth struct {
		JWT    JWTDetails
		Admins []string
	}

	JWTDetails struct {
		Secret               string
		AccessTokenDuration  time.Duration `mapstructure:"access_token_duration"`
		RefreshTokenDuration time.Duration `mapstructure:"refresh_token_duration"`
	}
)

var (
	once           sync.Once
	configInstance *Config
)

func GetConfig() *Config {
	once.Do(func() {
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
		viper.AddConfigPath("./")
		viper.AutomaticEnv()
		viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

		if err := viper.ReadInConfig(); err != nil {
			panic(err)
		}

		configInstance = &Config{}
		if err := viper.Unmarshal(&configInstance); err != nil {
			panic(err)
		}

		// Override with env vars (if set)
		if v := viper.GetString("DB_HOST"); v != "" {
			if v == "cloudsql" {
				configInstance.Db.Host = "/cloudsql/udcs-autograder:us-central1:autograder-db"
			} else {
				configInstance.Db.Host = v
			}
		}
		if v := viper.GetString("DB_PORT"); v != "" {
			configInstance.Db.Port = v
		}
		if v := viper.GetString("DB_USER"); v != "" {
			configInstance.Db.User = v
		}
		if v := viper.GetString("DB_PASSWORD"); v != "" {
			configInstance.Db.Password = v
		}
		if v := viper.GetString("DB_NAME"); v != "" {
			configInstance.Db.DBName = v
		}
		if v := viper.GetString("JWT_SECRET"); v != "" {
			configInstance.Auth.JWT.Secret = v
		}
	})

	return configInstance
}
