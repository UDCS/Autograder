package config

import (
	"strings"
	"sync"

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
		JWTSecret string
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

		if err := viper.Unmarshal(&configInstance); err != nil {
			panic(err)
		}
	})

	return configInstance
}
