class PagesController < ApplicationController
  before_filter :allow_iframe_requests
  
  def allow_iframe_requests
    response.headers.delete('X-Frame-Options')
  end
  
  def root
  end
  
  def asteroids
  end
end