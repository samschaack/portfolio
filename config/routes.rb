Rails.application.routes.draw do
  get '/asteroids', to: 'pages#asteroids'
  get '/music', to: 'pages#music'
  get '/drawings', to: 'pages#drawings'
  get '/resume', to: 'pages#pdf'
  get '/more', to: 'pages#more'
  root to: 'pages#root'
end
