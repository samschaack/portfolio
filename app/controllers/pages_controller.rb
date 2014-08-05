class PagesController < ApplicationController
  def root
  end
  
  def asteroids
  end
  
  def drawings
  end
  
  def music
  end
  
  def pdf
    pdf_filename = File.join(Rails.root, "public/resume.pdf")
    send_file(pdf_filename, :filename => "your_document.pdf", :disposition => 'inline', :type => "application/pdf")
  end
end