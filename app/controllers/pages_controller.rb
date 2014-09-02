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
    pdf_filename = File.join(Rails.root, "public/sam-schaack-resume-2.pdf")
    send_file(pdf_filename, :filename => "your_document.pdf", :disposition => 'inline', :type => "application/pdf")
  end

  def load_song
    # song_filename = File.join(Rails.root, "public/audios/AvecVous.m4a")
    song_filename = File.join(Rails.root, "public/audios/Ott_Baby_Robot_Mr_Balloon_Hands.mp3")
    send_file(song_filename)
  end

  def visualizer
  end

  def more
  end
end