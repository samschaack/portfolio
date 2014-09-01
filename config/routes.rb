Rails.application.routes.draw do
  get '/asteroids', to: 'pages#asteroids'
  get '/music', to: 'pages#music'
  get '/drawings', to: 'pages#drawings'
  get '/resume', to: 'pages#pdf'
  get '/visualizer', to: 'pages#visualizer'
  get '/more', to: 'pages#more'
  get '/song', to: 'pages#load_song'
  root to: 'pages#root'
end
