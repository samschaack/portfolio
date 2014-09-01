var portfolio = {};

$(document).ready(function() {
  $('body').on('mousedown', '.sizeable-image', startDrag);

  $('body').on('mousemove', dragImage);

  $('body').on('mouseup', endDrag);

  function startDrag(event) {
    event.preventDefault();
    portfolio.dragging = true;

    portfolio.initImgX = event.pageX;
    portfolio.initImgY = event.pageY;

    portfolio.curImg = $(event.target).data('id');

    portfolio.initWidth = $('img.sizeable-image[data-id="' + portfolio.curImg + '"]').width();
    portfolio.initHeight = $('img.sizeable-image[data-id="' + portfolio.curImg + '"]').height();

    portfolio.ratio = portfolio.initWidth / portfolio.initHeight;

    var position = $('img.sizeable-image[data-id="' + portfolio.curImg + '"]').position();

    portfolio.initLeft = position.left;
    portfolio.initTop = position.top;
  }

  function dragImage(event) {
    if (portfolio.dragging) {
      var $image = $('img.sizeable-image[data-id="' + portfolio.curImg + '"]');
      $image.css('max-width', 'none');

      var curX = event.pageX;
      var curY = event.pageY;

      var diffX = curX - portfolio.initImgX;
      var diffY = curY - portfolio.initImgY;

      var finWX;
      var finHY;

      var scaleFactor = 1;
      var initSize = Math.pow(Math.pow(portfolio.initWidth, 2) + Math.pow(portfolio.initHeight, 2), .5);

      if (diffX < 0 && diffY < 0) {
        scaleFactor = 1 - Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)) / (Math.pow(initSize, .9));
      } else if (diffX > 0 && diffY > 0) {
        scaleFactor = 1 + Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)) / (Math.pow(initSize, .9));
      }

      finWX = portfolio.initWidth * scaleFactor;
      finHY = portfolio.initHeight * scaleFactor;

      if (finHY < 75 && portfolio.ratio > 1) {
        finHY = 75;
        finWX = portfolio.ratio * 75;
      } else if (finWX < 75 && portfolio.ratio < 1) {
        finWX = 75;
        finHY = 75 / portfolio.ratio;
      } else if (finWX < 75 || finHY < 75 && portfolio.ratio === 1) {
        finWX = 75;
        finHY = 75;
      }

      $image.css('width', finWX.toString() + 'px');
      $image.css('height', finHY.toString() + 'px');
    }
  }

  function endDrag() {
    portfolio.dragging = false;
  }
});