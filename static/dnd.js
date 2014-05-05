function roundToNearest(origVal, placeVal, xDiffn) {
    var addX = origVal * 241;
    xDiff = xDiffn-(placeVal-origVal)*241;
    if(xDiff >= 482 && placeVal < 1) {
        return {pVal: placeVal+2, newX: (placeVal+2)*241 - addX};
    } else if(xDiff > 241 && placeVal < 2) {
        console.log("yey");
        return {pVal: placeVal+1, newX: (placeVal+1)*241 - addX};
    } else if(xDiff > 0) {
        return {pVal: placeVal, newX: (placeVal+0)*241 - addX};
    } else if(xDiff < -482 && placeVal > 1) {
        return {pVal: placeVal-2, newX: (placeVal-2)*241 - addX}; }
    else if(xDiff < -241 && placeVal > 0) {
        return {pVal: placeVal-1, newX: (placeVal-1)*241 - addX};
    } else { return {pVal: placeVal, newX: 0 - origVal}; }
}
(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            if(this.id == "musicPlayer1") {
                $("#iframeDivFixer1").css("display", "block");
            } else if(this.id == "musicPlayer2") {
                $("#iframeDivFixer2").css("display", "block");
            } else if(this.id == "musicPlayer3") {
                $("#iframeDivFixer3").css("display", "block");
            }
            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
              $('.draggable').offset({
                top:e.pageY + pos_y - drg_h,
                left:e.pageX + pos_x - drg_w
              }).off("mouseup").on("mouseup", function() {
                if(this.id == "musicPlayer1") {
                    $("#iframeDivFixer1").css("display", "none");
                } else if(this.id == "musicPlayer2") {
                    $("#iframeDivFixer2").css("display", "none");
                } else if(this.id == "musicPlayer3") {
                    $("#iframeDivFixer3").css("display", "none");
                }
                newVals = (roundToNearest(parseInt($(this).attr("origVal")), parseInt($(this).attr("placeVal")), parseInt($(this).css("top").split("px")[0])));
                oldPVal = $(this).attr("placeVal");
                $(this).css("top", newVals.newX + "px").css("left","0");
                $(".musicPlayer").each(function() {
                    var curPVal = parseInt($(this).attr("placeVal"));
                    var oldInt = parseInt(oldPVal);
                    var newInt = parseInt(newVals.pVal);
                    if(curPVal == oldInt) {
                        return;
                    }
                    if(curPVal < oldInt && curPVal < newInt) return;
                    if(curPVal > oldInt && curPVal > newInt) return;
                    if(oldInt < curPVal && newInt >= curPVal) {
                        $(this).css("top", (parseInt($(this).css("top").split("px")[0])-241) + "px");
                        $(this).attr("placeVal", parseInt($(this).attr("placeVal"))-1);
                    }
                    if(oldInt > curPVal && newInt <= curPVal) {
                        $(this).css("top", (parseInt($(this).css("top").split("px")[0])+241) + "px");
                        $(this).attr("placeVal", parseInt($(this).attr("placeVal"))+1);
                    }
                    console.log("changed");
                });
                $(this).attr("placeVal", newVals.pVal)
                $(this).removeClass('draggable').css('z-index', z_idx);

                $('.draggable').off("mousemove");
                $('.draggable').off("mouseup");
                $(this).off("mouseup");
                $(this).off("mousemove");
                $(this).parents().off("mousemove");
              });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
          if(this.id == "musicPlayer1") {
              $("#iframeDivFixer").css("display", "none");
          }
          if(opt.handle === "") {
              $(this).removeClass('draggable');
          } else {
              $(this).removeClass('active-handle').parent().removeClass('draggable');
          }
          $(this).off("mouseup");
          $('#musicPlayer1').off("mouseup");
      });
    }
})(jQuery);