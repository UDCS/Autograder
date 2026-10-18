package config

import (
	"os"
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
		App    *App
	}

	Server struct {
		Port string
	}

	App struct {
		TimeZone string
	}

	Db struct {
		Host            string
		Port            string
		User            string
		Password        string
		DBName          string
		SslMode         string
		MaxOpenConns    int           `mapstructure:"max_open_conns"`
		MaxIdleConns    int           `mapstructure:"max_idle_conns"`
		ConnMaxLifetime time.Duration `mapstructure:"conn_max_lifetime"`
		ConnMaxIdleTime time.Duration `mapstructure:"conn_max_idle_time"`
	}

	Auth struct {
		JWT    JWTDetails
		Admins []string
	}

	JWTDetails struct {
		Secret               string
		AccessTokenDuration  time.Duration `mapstructure:"access_token_duration"`
		RefreshTokenDuration time.Duration `mapstructure:"refresh_token_duration"`
		SessionMaxDuration   time.Duration `mapstructure:"session_max_duration"`
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
		viper.SetDefault("app.timezone", "America/Chicago")
		viper.SetDefault("auth.jwt.session_max_duration", "336h")
		viper.SetDefault("db.max_open_conns", 5)
		viper.SetDefault("db.max_idle_conns", 2)
		viper.SetDefault("db.conn_max_lifetime", "30m")
		viper.SetDefault("db.conn_max_idle_time", "5m")

		if err := viper.ReadInConfig(); err != nil {
			panic(err)
		}

		if err := viper.Unmarshal(&configInstance); err != nil {
			panic(err)
		}

		if configInstance.App == nil {
			configInstance.App = &App{TimeZone: "America/Chicago"}
		}
		// Fail fast on an invalid timezone name rather than at query time.
		if _, err := time.LoadLocation(configInstance.App.TimeZone); err != nil {
			panic(err)
		}
	})

	return configInstance
}

func GetBaseURL() string {
	url := os.Getenv("BASE_URL")
	if url == "" {
		return "http://localhost:8080"
	}
	return url
}
