var Config = (function (){

    var path = './img/origin/';
    var thumbPath = './img/thumb/';

    var imgs = [
        //{name: "WA-001.jpg", sort: 5, cls: "featured", isVideo: false, videoID: "",paddingBottom:"66.6%"},
        {name: "WA-002.jpg", sort: 10, cls: "featured", isVideo: false, videoID: "",paddingBottom:"60.000004%"},
        {name: "WA-003.jpg", sort: 15, cls: "featured", isVideo: false, videoID: "",paddingBottom:"59.399998%"},
        {name: "WA-004.jpg", sort: 20, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-005.jpg", sort: 25, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-006.jpg", sort: 30, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.2%"},
        {name: "WA-007.jpg", sort: 35, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"55.6%"},
        {name: "WA-008.jpg", sort: 40, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"55.6%"},
        {name: "WA-009.jpg", sort: 45, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-010.jpg", sort: 50, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"116.788315%"},
        {name: "WA-011.jpg", sort: 55, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"66.0%"},
        {name: "WA-012.jpg", sort: 60, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"133.33334%"},
        {name: "WA-013.jpg", sort: 65, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"133.33334%"},
        {name: "WA-014.jpg", sort: 70, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"60.000004%"},
        {name: "WA-015.jpg", sort: 75, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-016.jpg", sort: 80, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-017.JPG", sort: 85, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"62.4%"},
        {name: "WA-018.JPG", sort: 90, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"58.8%"},
        {name: "WA-019.jpg", sort: 95, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"55.6%"},
        {name: "WA-020.JPG", sort: 100, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"68.4%"},
        {name: "WA-021.jpg", sort: 105, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"114.55847%"},
        {name: "WA-022.jpg", sort: 110, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"123.39332%"},
        {name: "WA-023.JPG", sort: 115, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"65.8%"},
        {name: "WA-024.JPG", sort: 120, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"133.33334%"},
        {name: "WA-025.JPG", sort: 125, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-026.JPG", sort: 130, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"50.0%"},
        {name: "WA-027.JPG", sort: 135, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"50.0%"},
        {name: "WA-028.JPG", sort: 140, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"77.0%"},
        {name: "WA-029.JPG", sort: 145, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"50.0%"},
        {name: "WA-030.JPG", sort: 150, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-031.jpg", sort: 155, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-032.JPG", sort: 160, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"100.0%"},
        {name: "WA-033.jpg", sort: 165, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"125.0%"},
        {name: "WA-034.JPG", sort: 170, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"100.0%"},
        {name: "WA-035.JPG", sort: 175, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"50.0%"},
        {name: "WA-036.jpg", sort: 180, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"50.4%"},
        {name: "WA-037.jpg", sort: 185, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"67.4%"},
        {name: "WA-038.jpg", sort: 190, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-039.jpg", sort: 195, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"100.0%"},
        {name: "WA-040.jpg", sort: 200, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"62.6%"},
        {name: "WA-041.jpg", sort: 205, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"60.000004%"},
        {name: "WA-042.jpg", sort: 210, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-043.jpg", sort: 215, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-044.jpg", sort: 220, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"70.200005%"},
        {name: "WA-045.jpg", sort: 225, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"166.66666%"},
        {name: "WA-046.jpg", sort: 230, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-047.jpg", sort: 235, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"62.6%"},
        {name: "WA-048.jpg", sort: 240, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"47.0%"},
        {name: "WA-049.jpg", sort: 245, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-050.jpg", sort: 250, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"57.6%"},
        {name: "WA-051.jpg", sort: 255, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"56.199997%"},
        {name: "WA-052.jpg", sort: 260, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-053.jpg", sort: 265, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"58.600002%"},
        {name: "WA-054.jpg", sort: 270, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"90.0%"},
        {name: "WA-055.jpg", sort: 275, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"50.0%"},
        {name: "WA-056.jpg", sort: 280, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-057.JPG", sort: 285, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-058.jpg", sort: 290, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-059.jpg", sort: 295, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-060.jpg", sort: 300, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-061.jpg", sort: 305, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"51.0%"},
        {name: "WA-062.jpg", sort: 310, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"36.0%"},
        {name: "WA-063.jpg", sort: 315, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"71.4%"},
        {name: "WA-064.jpg", sort: 320, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"72.399994%"},
        {name: "WA-065.jpg", sort: 325, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"56.199997%"},
        {name: "WA-066.jpg", sort: 330, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"92.799995%"},
        {name: "WA-067.jpg", sort: 335, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"66.6%"},
        {name: "WA-068.jpg", sort: 340, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"116.788315%"},
        {name: "WA-069.JPG", sort: 345, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-070.jpg", sort: 350, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"64.200005%"},
        {name: "WA-071.jpg", sort: 355, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"66.6%"},
        {name: "WA-072.jpg", sort: 360, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"62.4%"},
        {name: "WA-073.jpg", sort: 365, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"56.199997%"},
        {name: "WA-074.jpg", sort: 370, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"145.45454%"},
        {name: "WA-075.jpg", sort: 375, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-076.jpg", sort: 380, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"123.07693%"},
        {name: "WA-077.jpg", sort: 385, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"68.6%"},
        {name: "WA-078.jpg", sort: 390, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"127.65957%"},
        {name: "WA-079.jpg", sort: 395, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"65.200005%"},
        {name: "WA-080.jpg", sort: 400, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"68.6%"},
        {name: "WA-081.jpg", sort: 405, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"60.000004%"},
        {name: "WA-082.jpg", sort: 410, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"64.200005%"},
        {name: "WA-083.jpg", sort: 415, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"68.6%"},
        {name: "WA-084.jpg", sort: 420, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"149.53271%"},
        {name: "WA-085.jpg", sort: 425, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"54.2%"},
        {name: "WA-086.jpg", sort: 430, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"83.200005%"},
        {name: "WA-087.jpg", sort: 435, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"68.6%"},
        {name: "WA-088.jpg", sort: 440, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"62.4%"},
        {name: "WA-089.jpg", sort: 445, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"64.200005%"},
        {name: "WA-090.jpg", sort: 450, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"64.200005%"},
        {name: "WA-091.jpg", sort: 455, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-092.jpg", sort: 460, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"133.33334%"},
        {name: "WA-093.JPG", sort: 465, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"50.0%"},
        {name: "WA-094.jpg", sort: 470, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"122.762146%"},
        {name: "WA-095.jpg", sort: 475, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-096.jpg", sort: 480, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"138.32852%"},
        {name: "WA-097.jpg", sort: 485, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"60.000004%"},
        {name: "WA-098.jpg", sort: 490, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"133.33334%"},
        {name: "WA-099.jpg", sort: 495, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-100.jpg", sort: 500, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"60.399998%"},
        {name: "WA-101.jpg", sort: 505, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
        {name: "WA-102.jpg", sort: 510, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"66.6%"},
        {name: "WA-103.jpg", sort: 515, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"133.33334%"},
        {name: "WA-104.jpg", sort: 520, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"60.000004%"},
        {name: "WA-105.jpg", sort: 525, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"50.0%"},
        {name: "WA-106.jpg", sort: 530, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"111.111115%"},
        {name: "WA-107.jpg", sort: 535, cls: "thumb", isVideo: false, videoID: "",paddingBottom:"75.0%"},
    ];




    return {
        init:function(){
            var grid = $(".grid");
            if(grid.is("*")){
                var imgs = this.listWorks();
                $.each(imgs,function(index,item){
                    var gitem = '<div id="'+item.name+'" class="item '+item.cls+' lazy fade frame">';
                    gitem += '<a href="/work/" ';
                    gitem += ' data-url="./work.html" ';
                    gitem += ' data-href="'+Config.imgPath(item.name)+'"';
                    gitem += ' data-title="- Harp -"';
                    gitem += ' data-client="Zaha Hadid Architects - Danjiang/Taiwan"';
                    gitem += ' data-year="2015"';
                    gitem += ' data-isVideo=""';
                    gitem += ' data-videoID="0"';
                    gitem += ' data-alt="- Harp - Zaha Hadid Architects - Danjiang/Taiwan, 2015 by Mir">';
                    gitem += ' <span class="image" data-alt style="padding-bottom: '+item.paddingBottom+'">';
                    gitem += ' <span data-src="'+Config.thumb(item.name)+'"></span>';
                    gitem += ' </span></a></div>';

                    grid.append(gitem);









                });



            }
        }
        ,
        listWorks:function(){
            imgs.sort(function(w1,w2){
                return w1.sort - w2.sort;
            });
            return imgs;
        },
        imgPath:function(name){
            return path+name;
        },
        thumb:function(name){
            return thumbPath+name;
        }
    }




})();