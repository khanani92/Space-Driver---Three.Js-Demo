$(function(){
    var container, scene, camera, renderer, stats, plane,rotation_control,skyBox,light_sphere,star,animating=false;
    var keyboard = new THREEx.KeyboardState(),
        clock = new THREE.Clock(),
        box_location = 5000000,
        collidableMeshList = [],
        rock_collision = false,
        rock_direction,
        rock_previous,
        rock_position_next = (box_location+200400),
        distanceCovered = 0;
    $("#game_box").hide();
    $("#btn1").on("click",function(){
        //$(".end").hide();
        $("#mainpg").hide();
        $("#game_box").show();
        $("#game_box").html("<div id='container' style='width: 99%;height: 99%;position: absolute; background-color: black'></div>");
        var container = document.getElementById("container");
        var SCREEN_WIDTH = container.offsetWidth, SCREEN_HEIGHT = container.offsetHeight;
        if(Detector.webgl)
            renderer = new THREE.WebGLRenderer({antialias:true});
        else
            renderer = new THREE.CanvasRenderer();
        renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
        container.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR =400000;
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE,ASPECT,NEAR,FAR);
        scene.add(camera);
        camera.position.set(0,100,box_location+220000);
        camera.lookAt(scene.position);
        THREEx.WindowResize(renderer,camera);
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        stats.domElement.style.zIndex = 100;
        container.appendChild(stats.domElement);
        var light1 = new THREE.PointLight(0xffffff,1.5);
        light1.position.set(100,100,48100);
        scene.add(light1);
        var light2 = new THREE.DirectionalLight(0xffffff,1.5);
        light2.position.set(100,100,48100);
        scene.add(light2);
        light_Sphere();
        var skyGeometry = new THREE.CubeGeometry( 9000, 5000, 500000 );
        var sky_map = THREE.ImageUtils.loadTexture("images/bg_1.jpg");
        var skyMaterial =    new THREE.MeshBasicMaterial({
            map:sky_map,
            side: THREE.BackSide });
        skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        skyBox.position.set(0,0,box_location);
        scene.add( skyBox );
        plane_call();
        star_call();
        rockCalculation();
        //console.log("sky"+skyBox.position.x + "-------" + skyBox.position.y + "-------" + skyBox.position.z);
        //console.log("camera" + camera.position.x + "-------" + camera.position.y + "-------" + camera.position.z);
        run();
        $("#sec1").html("<h3>Error will be Displayed here</h3>"+container.offsetWidth +container.offsetHeight);
    });

    function light_Sphere(){
        var sphere_loc = box_location+215400;
        for(var i=0;i<=15;i++){
            var sphere_light = new THREE.DirectionalLight(0xd3d2d2,0.05);
            var sphere_material = new THREE.MeshPhongMaterial({color:"yellow"});
            var sphere_geometry = new THREE.SphereGeometry(20,32,16);
            var sphere = new THREE.Mesh(sphere_geometry,sphere_material);
            scene.add(sphere_light);
            scene.add(sphere);
            sphere.position.set(800,500, (sphere_loc-(22000*i)));
            sphere_light.position.set(800,500, (sphere_loc-(22000*i)));
            sphere_light = new THREE.DirectionalLight(0xd3d2d2,0.05);
            sphere = new THREE.Mesh(sphere_geometry,sphere_material);
            scene.add(sphere_light);
            scene.add(sphere);
            sphere.position.set(-920,-530, (sphere_loc-(22000*i)));
            sphere_light.position.set(-920,-530, (sphere_loc-(22000*i)));
        }
    }
    function plane_call(){
        var loader = new THREE.JSONLoader();
        loader.load( "js/model/sf_1.js", function( geometry,materials ) {
            var material = new THREE.MeshFaceMaterial(materials);
            plane = new THREE.Mesh( geometry,material  );
            plane.scale.set( 100, 100, 100 );
            plane.position.y = -50;
            plane.position.z = box_location+218400;
            scene.add(plane);
          //  console.log("plane" + plane.position.x + "-------" + plane.position.y + "-------" + plane.position.z);
        })
    }
    function planeController(){
        if ( keyboard.pressed("w") )
            if(animating && distanceCovered != 465500){
                plane.position.z -= 500;
                camera.position.z -= 500;
                distanceCovered += 500;
               // console.log(distanceCovered);
                checkRockNeed();
            }
        if ( keyboard.pressed("up") )
            if(animating){
                if(plane.position.y <= 390){
                    plane.position.y += 20;
                    camera.position.y += 5;
                }
            }
        if ( keyboard.pressed("down") )
            if(animating){
                if(plane.position.y >= -460){
                    plane.position.y -= 20;
                    camera.position.y -= 5;
                }
            }
        if ( keyboard.pressed("left") )
            if(animating){
                if(plane.position.x >= -899){
                    plane.rotation.z += 0.05;
                    plane.position.x -= 20;
                    camera.position.x -= 5;
                    plane.rotation.z -= 0.01;
                }
            }
        if ( keyboard.pressed("right") )
            if(animating){
                if(plane.position.x <= 760){
                    plane.rotation.z -= 0.05;
                    plane.position.x += 20;
                    camera.position.x += 5;
                    plane.rotation.z += 0.01;

                }
            }
    }

    function star_call(){
        for(var i=0;i<=15;i++){
            //console.log("star : "+ i);
            var loader = new THREE.JSONLoader();
            loader.load( "js/model/star_1.js", function( geometry ) {
                var material =new THREE.MeshBasicMaterial({color:"yellow"});
                var star_map = THREE.ImageUtils.loadTexture("js/model/texture/star_1.jpg");
                var starMaterial =    new THREE.MeshBasicMaterial({map:star_map});
                star = new THREE.Mesh( geometry,starMaterial  );
                star.scale.set( 30, 30, 30 );
                star.position.y = -50;
                star.position.z = (box_location+216400)+((i+1)*1000);
                scene.add(star);
            })
        }
    }
    function rockCalculation(){
        var shape_id = Math.floor(Math.random()*(1+3));
        var map_id = Math.floor(Math.random()*(1+6));
        var rock_size = Math.floor(Math.random()*(1+100-50)+50);
        var animation_type = Math.floor(Math.random()*(1+3));
        rockCall(shape_id,map_id,rock_size,animation_type);
    }

    function rockCall(shape_id,map_id,rock_size,animation_type){
        var rock_shape = [
            {id:1,src:"rock_2.js"},
            {id:2,src:"rock_3.js"},
            {id:3,src:"rock_4.js"},
            {id:4,src:"rock_5.js"}
        ];
        var rock_material = [
            {id:1,src:"rock_1.jpg"},
            {id:2,src:"rock_2.jpg"},
            {id:3,src:"rock_3.jpg"},
            {id:4,src:"rock_4.jpg"},
            {id:5,src:"rock_5.jpg"},
            {id:6,src:"rock_6.jpg"},
            {id:7,src:"rock_7.jpg"}
        ];
        var loader2 = new THREE.JSONLoader();
        loader2.load( "js/model/"+rock_shape[shape_id].src, function( geometry) {
            //console.log(materials[0]+"asas")
            var rock_map = THREE.ImageUtils.loadTexture("js/model/texture/"+rock_material[map_id].src);
            var rockMaterial =    new THREE.MeshBasicMaterial({map:rock_map})
            rock = new THREE.Mesh( geometry,rockMaterial  );
            rock.scale.set( rock_size, rock_size, rock_size );
            rock.position.y = 0;
            rock.position.z = rock_position_next+1000;if(rock_previous){
                scene.children.forEach(function(obj){
                    if(obj.id == rock_previous){
                        scene.remove(obj);
                    }
                })
            }
            rock_previous = rock.id;
            scene.add(rock);
            var randomPostion_x = Math.floor(Math.random()*(1+760-(-899))+(-899));
            var randomPostion_y = Math.floor(Math.random()*(1+390-(-460))+(-460));
            collidableMeshList.push(rock);
            rock_direction  =  animation_type ;
            if(animation_type == 0)
            {rock.position.x = randomPostion_x}
            if(animation_type == 1)
            {rock.position.x = randomPostion_y}
            if(animation_type == 2)
            {rock.position.y = randomPostion_x}
            if(animation_type == 3)
            {rock.position.y = randomPostion_y}

        })
    }
    function checkRockNeed(){
        if((plane.position.z) == rock_position_next ){

            rockCalculation();
            rock_position_next -= 17000;
        }}
    function positionUpdate(){
        //console.log("plane" + plane.position.x + "-------" + plane.position.y + "-------" + plane.position.z);
        //console.log("camera" + camera.position.x + "-------" + camera.position.y + "-------" + camera.position.z);
        //.log("RN"+rock_position_next);
    }
    function run(){
        renderer.render(scene,camera);
        setTimeout(function(){requestAnimationFrame(run);},1000/90);
        update();
    }
    function update(){
        var delta = clock.getDelta();
        planeController();
        var originPoint = plane.position.clone();
        //clearText();
        for (var vertexIndex = 0; vertexIndex < plane.geometry.vertices.length; vertexIndex++)
        {
            var localVertex = plane.geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4( plane.matrix );
            var directionVector = globalVertex.sub( plane.position ); // RAY Casting Function
            var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
            var collisionResults = ray.intersectObjects( collidableMeshList );
            if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
            {
                rock_collision = !rock_collision
            }
        }
        if(rock_collision == true){
            clearInterval(position_update);
            restartAllVar();
            $("#game_box").html("");
            $(".menu").hide();
            $(".end").show();
            $("#mainpg").show();
            setInterval(showMenu,5000);
        }
        stats.update();
        animating = !animating;
    }
    var position_update = setInterval(positionUpdate,5000);
    function restartAllVar(){
        container = undefined;
        scene = undefined;
        camera = undefined;
        renderer = undefined;
        stats = undefined;
        plane = undefined;
        rotation_control = undefined;
        skyBox = undefined;
        light_sphere = undefined;
        rock_previous = undefined;
        star= undefined;
        animating=false;
        keyboard = new THREEx.KeyboardState();
        clock = new THREE.Clock();
        box_location = 5000000;
        collidableMeshList = [];
        rock_collision = false;
        rock_direction = undefined;
        rock_position_next = (box_location+200400);
        distanceCovered = 0;
    }
    function showMenu(){
        $(".end").hide();
        $(".menu").show();
    }
});