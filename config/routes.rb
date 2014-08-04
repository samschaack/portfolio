Rails.application.routes.draw do
  get '/asteroids', to: 'pages#asteroids'
  get '/music', to: 'pages#music'
  get '/art', to: 'pages#art'
  root to: 'pages#root'
end
