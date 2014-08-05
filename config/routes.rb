Rails.application.routes.draw do
  get '/asteroids', to: 'pages#asteroids'
  get '/music', to: 'pages#music'
  get '/drawings', to: 'pages#drawings'
  get '/resume', to: 'pages#pdf'
  root to: 'pages#root'
end
