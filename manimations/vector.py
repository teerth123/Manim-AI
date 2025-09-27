from manim import *

# Geist Design System Colors (Dark Mode)
RED_300 = "#ff6666"
RED_500 = "#ff0000"
PINK_400 = "#ff99ff"
PINK_600 = "#ff66ff"
BLUE_500 = "#d3a0f0"
BLUE_700 = "#d1c6f0"
GREEN_500 = "#80e080"
GREEN_700 = "#4db84d"
TEAL_500 = "#80e0e0"
TEAL_700 = "#4db8b8"
PURPLE_500 = "#bf80ff"
PURPLE_700 = "#a64dff"
GRAY_1000 = "#ffffff"
GRAY_800 = "#111111"
GRAY_ALPHA_500 = "rgba(255,255,255,0.24)"

class VectorYZPlaneIntercept(ThreeDScene):
    def construct(self):
        self.camera.background_color = GRAY_800
        
        # Initial camera orientation for a good starting view
        self.set_camera_orientation(phi=70 * DEGREES, theta=30 * DEGREES)

        # 3D Axes
        axes = ThreeDAxes(
            x_range=[-5, 5, 1],
            y_range=[-5, 5, 1],
            z_range=[-5, 5, 1],
            axis_config={"color": TEAL_500, "stroke_width": 2},
        )
        x_label = axes.get_x_axis_label("X", edge=DR).set_color(GRAY_1000).scale(0.7)
        y_label = axes.get_y_axis_label("Y", edge=UP).set_color(GRAY_1000).scale(0.7)
        z_label = axes.get_z_axis_label("Z", edge=OUT).set_color(GRAY_1000).scale(0.7)

        # YZ Plane (where x = 0)
        yz_plane = Rectangle(width=8, height=8).set_fill(TEAL_700, opacity=0.4).set_stroke(TEAL_700, width=1)
        yz_plane.rotate(PI/2, axis=Y_AXIS)

        # Vector coordinates (example)
        vec_coords = np.array([3, 2, 4])
        
        # The 3D vector from the origin (removed tip_length)
        vector = Arrow3D(
            ORIGIN, vec_coords, 
            color=PURPLE_500, 
            thickness=0.08
        )
        vector_label = MathTex("v", color=PURPLE_500).scale(0.7).next_to(vector.get_end(), UR, buff=0.2)
        
        # Intercept point on the YZ plane (projection of vector's end onto x=0)
        intercept_point_coords = np.array([0, vec_coords[1], vec_coords[2]])
        intercept_dot = Dot3D(point=intercept_point_coords, color=RED_500, radius=0.1)
        intercept_label = MathTex("(0, y, z)", color=RED_500).scale(0.6).next_to(intercept_dot, LEFT + OUT, buff=0.1)

        # Projection line from vector tip to the intercept point
        projection_line = Line3D(
            vec_coords, intercept_point_coords, 
            color=PINK_600
        )

        # Add initial mobjects
        self.add(axes, x_label, y_label, z_label)
        # Fix labels in frame so they always face the camera
        self.add_fixed_in_frame_mobjects(x_label, y_label, z_label, vector_label, intercept_label)

        # Animation sequence
        self.play(
            FadeIn(axes),
            FadeIn(x_label),
            FadeIn(y_label),
            FadeIn(z_label),
            FadeIn(yz_plane),
            run_time=1.5
        )
        self.play(
            Create(vector),
            Write(vector_label),
            run_time=1.5
        )

        self.play(
            Create(projection_line),
            GrowFromCenter(intercept_dot),
            Write(intercept_label),
            run_time=1.5
        )
        
        self.wait(1)

        # 360-degree view rotation around the scene
        self.move_camera(
            theta=30 * DEGREES + 360 * DEGREES,
            run_time=10,
            rate_func=linear
        )

        self.wait(1)
